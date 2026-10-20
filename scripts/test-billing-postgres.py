"""Synthetic integration suite for a disposable LOCAL PostgreSQL cluster only.

Requires psql, a local admin PGUSER, and BILLING_PG_DISPOSABLE=1. Never reads
Supabase environment files. Creates/drops only its own UUID-named database.
Run: python scripts/test-billing-postgres.py
This auth.role shim tests RPC role contracts, not real PostgREST JWT validation.
"""
import concurrent.futures
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
import uuid

ROOT = Path(__file__).resolve().parents[1]
DB = "phase17_test_" + uuid.uuid4().hex
ACTOR = "12345678-1234-4234-8234-123456789012"
SERVICE = "set role service_role; set request.jwt.claim.role='service_role'; "
ENV = dict(os.environ)
ENV["PGHOST"] = ENV.get("PGHOST", "127.0.0.1")
ENV["PGCONNECT_TIMEOUT"] = "5"
for key in ["PGHOSTADDR", "PGSERVICE", "PGSERVICEFILE", "PGOPTIONS", "PGDATABASE"]:
    ENV.pop(key, None)  # Never allow inherited connection-service overrides.


def literal(value):
    return "null" if value is None else "'" + str(value).replace("'", "''") + "'"


def sql(query, *, database=DB, service=False, ok=True):
    result = subprocess.run(
        ["psql", "-XAtq", "-v", "ON_ERROR_STOP=1", "-d", database],
        input=(SERVICE if service else "") + query, text=True,
        capture_output=True, env=ENV, timeout=30,
    )
    if ok and result.returncode:
        raise AssertionError(result.stderr)
    if not ok:
        if result.returncode == 0:
            raise AssertionError("Protected SQL unexpectedly succeeded")
        return result.stderr
    return result.stdout.strip()


def creation(event=None, *, customer="Synthetic Customer", qty=2, rate=50,
             total=100, lines=None):
    lines = lines if lines is not None else [dict(description="Synthetic service",
              quantity=qty, rate_paise=rate, line_total_paise=total)]
    return ("select public.billing_create_invoice(" + ",".join([
        literal(customer), "date '2026-10-18'", "null", "''",
        literal(json.dumps(lines)) + "::jsonb", literal(ACTOR) + "::uuid",
        literal("SYSTEM" if event else "ADMIN"), literal(event),
    ]) + ");")


def issue(event=None, **kwargs):
    return json.loads(sql(creation(event, **kwargs), service=True))


def credit(invoice, amount, utr=None):
    utr = utr or uuid.uuid4().hex.upper()
    return "select public.billing_verify_slice_credit(" + ",".join([
        literal(invoice["id"]) + "::uuid", literal(utr), str(amount),
        "now() - interval '1 hour'", "'SYNTHETIC TEST ONLY'", literal(ACTOR) + "::uuid",
    ]) + ");"


AUTO_DIGEST = object()
AUTO_UTR = object()


def observation(invoice, payment=None, event="SUCCESS", amount=100, utr=AUTO_UTR, digest=AUTO_DIGEST, order=None):
    return "select public.billing_record_youpi_observation(" + ",".join([
        literal(payment or str(uuid.uuid4())) + "::uuid",
        literal(order or invoice["invoiceNumber"]), literal(event), str(amount),
        literal(uuid.uuid4().hex.upper() if utr is AUTO_UTR else utr), literal(uuid.uuid4().hex * 2 if digest is AUTO_DIGEST else digest),
    ]) + ");"


class BillingPostgres(unittest.TestCase):
    def test_01_normal_submission_and_retry(self):
        event = "synthetic:" + uuid.uuid4().hex
        first = issue(event)
        self.assertEqual(first, issue(event))
        self.assertEqual(first, issue(event, customer=" Synthetic Customer "))
        self.assertEqual(first["status"], "UNPAID")
        self.assertEqual(sql("select count(*) from billing_private.audit_events where invoice_id="
                             + literal(first["id"]) + "::uuid and event_type='INVOICE_CREATED';"), "1")

    def test_02_conflicting_event_payload(self):
        event = "synthetic:" + uuid.uuid4().hex
        issue(event)
        self.assertIn("SYSTEM_EVENT_PAYLOAD_CONFLICT", sql(creation(event, customer="Different"), service=True, ok=False))
        self.assertIn("SYSTEM_EVENT_PAYLOAD_CONFLICT", sql(creation(event, qty=1, rate=100), service=True, ok=False))

    def test_03_concurrent_identical_event(self):
        event = "synthetic:" + uuid.uuid4().hex
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _: issue(event), range(8)))
        self.assertEqual(len({r["id"] for r in results}), 1)

    def test_04_concurrent_invoice_numbering(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _: issue(), range(16)))
        self.assertEqual(len({r["invoiceNumber"] for r in results}), 16)

    def test_05_concurrent_conflicting_event(self):
        event = "synthetic:" + uuid.uuid4().hex
        def submit(customer):
            try:
                return issue(event, customer=customer)
            except AssertionError as error:
                self.assertIn("SYSTEM_EVENT_PAYLOAD_CONFLICT", str(error))
                return None
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(submit, ["Synthetic A", "Synthetic B"]))
        self.assertEqual(sum(r is not None for r in results), 1)

    def test_06_role_denial_and_service_claim(self):
        sql(creation(), ok=False)  # owner without service JWT claim is denied
        for role in ["anon", "authenticated"]:
            sql(f"set role {role}; " + creation(), ok=False)
            sql(f"set role {role}; set request.jwt.claim.role='service_role'; " + creation(), ok=False)
        sql("set role service_role; " + creation(), ok=False)
        self.assertEqual(issue()["status"], "UNPAID")

    def test_07_private_tables_and_rls(self):
        for table in ["invoices", "invoice_lines", "bank_credit_evidence", "audit_events", "receipts", "youpi_observations"]:
            for role in ["anon", "authenticated", "service_role"]:
                sql(f"set role {role}; select * from billing_private.{table};", ok=False)
                # A synthetic grant rolled back in the same session isolates RLS.
                if role != "service_role":
                    count = sql(f"begin; grant usage on schema billing_private to {role}; "
                                f"grant select on billing_private.{table} to {role}; set role {role}; "
                                f"select count(*) from billing_private.{table}; rollback;")
                    self.assertEqual(count, "0")

    def test_08_atomic_creation_rollback(self):
        event = "synthetic:" + uuid.uuid4().hex
        sql("begin; " + SERVICE + creation(event) + "select 1/0; commit;", ok=False)
        self.assertEqual(sql("select count(*) from billing_private.invoices where source_event_key=" + literal(event)), "0")

    def test_09_numeric_boundaries(self):
        self.assertEqual(issue(qty=1, rate=10000000000, total=10000000000)["totalPaise"], 10000000000)
        self.assertEqual(issue(lines=[dict(description="Zero rate", quantity=2147483647, rate_paise=0, line_total_paise=0),
                                      dict(description="Payable", quantity=1, rate_paise=1, line_total_paise=1)])["totalPaise"], 1)
        for kwargs in [dict(qty=2147483648, rate=0, total=0), dict(qty=0), dict(rate=-1),
                       dict(total=101), dict(qty=1, rate=10000000001, total=10000000001),
                       dict(qty=2147483647, rate=9223372036854775807)]:
            sql(creation(**kwargs), service=True, ok=False)

    def test_10_partial_full_and_retry_after_payment(self):
        event = "synthetic:" + uuid.uuid4().hex
        invoice = issue(event)
        self.assertEqual(json.loads(sql(credit(invoice, 40), service=True))["status"], "PARTIAL")
        sql("select public.billing_get_receipt(" + literal(invoice["id"]) + "::uuid)", service=True, ok=False)
        final = json.loads(sql(credit(invoice, 60), service=True))
        self.assertEqual(final["status"], "PAID")
        self.assertEqual(final["outstandingPaise"], 0)
        receipt = json.loads(sql("select public.billing_get_receipt(" + literal(invoice["id"]) + "::uuid)", service=True))
        self.assertEqual(receipt["paidPaise"], 100)
        self.assertEqual(len(receipt["verifiedCredits"]), 2)
        self.assertEqual(issue(event)["status"], "PAID")

    def test_11_duplicate_utr_and_overcredit(self):
        first, second = issue(), issue()
        utr = uuid.uuid4().hex.upper()
        sql(credit(first, 40, utr), service=True)
        sql(credit(first, 40, utr), service=True, ok=False)
        sql(credit(second, 40, utr), service=True, ok=False)
        sql(credit(first, 61), service=True, ok=False)
        self.assertEqual(sql("select sum(amount_paise) from billing_private.bank_credit_evidence where invoice_id=" + literal(first["id"])), "40")

    def test_12_concurrent_overcredit(self):
        invoice = issue()
        def submit(_):
            try:
                sql(credit(invoice, 60), service=True)
                return True
            except AssertionError as error:
                self.assertIn("Credit exceeds", str(error))
                return False
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
            self.assertEqual(sum(pool.map(submit, range(2))), 1)

    def test_13_settlement_rollback(self):
        invoice = issue()
        sql("begin; " + SERVICE + credit(invoice, 100) + "select 1/0; commit;", ok=False)
        data = json.loads(sql("select public.billing_get_invoice(" + literal(invoice["id"]) + "::uuid)", service=True))
        self.assertEqual((data["status"], data["paidPaise"]), ("UNPAID", 0))
        self.assertEqual(sql("select count(*) from billing_private.receipts where invoice_id=" + literal(invoice["id"])), "0")

    def test_14_gateway_duplicate_contradictions_and_no_settlement(self):
        invoice, payment = issue(), str(uuid.uuid4())
        query = observation(invoice, payment, digest="a" * 64, utr="TESTUTR00001")
        self.assertTrue(json.loads(sql(query, service=True))["recorded"])
        self.assertTrue(json.loads(sql(query, service=True))["duplicate"])
        for changes in [dict(amount=200), dict(utr="TESTUTR00002"), dict(order="UNKNOWN"), dict(digest="b" * 64)]:
            args = dict(digest="a" * 64, utr="TESTUTR00001")
            args.update(changes)
            result = json.loads(sql(observation(invoice, payment, **args), service=True))
            self.assertEqual(result, dict(recorded=False, duplicate=False, decision="SECURITY_REVIEW_CONFLICT"))
        self.assertEqual(sql("select count(*) from billing_private.audit_events where invoice_id=" + literal(invoice["id"]) + " and event_type='YOUPI_OBSERVATION_CONFLICT'"), "4")
        data = json.loads(sql("select public.billing_get_invoice(" + literal(invoice["id"]) + "::uuid)", service=True))
        self.assertEqual((data["status"], data["paidPaise"]), ("UNPAID", 0))
        self.assertEqual(sql("select count(*) from billing_private.receipts where invoice_id=" + literal(invoice["id"])), "0")

    def test_15_invalid_gateway_binding(self):
        invoice = issue()
        for kwargs in [dict(order="UNKNOWN"), dict(amount=99), dict(utr=None), dict(event="PAID"), dict(digest="bad"), dict(digest=None)]:
            sql(observation(invoice, **kwargs), service=True, ok=False)

    def test_16_concurrent_gateway_delivery(self):
        invoice = issue()
        query = observation(invoice)
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _: json.loads(sql(query, service=True)), range(8)))
        self.assertEqual(sum(r["recorded"] for r in results), 1)
        self.assertEqual(sum(r["duplicate"] for r in results), 7)

    def test_17_immutable_records_even_for_owner_dml(self):
        invoice = issue()
        sql(credit(invoice, 100), service=True)
        sql(observation(invoice), service=True)
        invoice_id = literal(invoice["id"])
        for field, value in [("total_paise", "99"), ("customer_name", "'Other'"),
                             ("issued_on", "date '2025-01-01'"), ("source_event_key", "'event:changed'")]:
            sql(f"update billing_private.invoices set {field}={value} where id={invoice_id}", ok=False)
        sql(f"delete from billing_private.invoices where id={invoice_id}", ok=False)
        for table, field, value in [("invoice_lines", "rate_paise", "1"),
                                    ("bank_credit_evidence", "amount_paise", "1"),
                                    ("audit_events", "actor", "'other'"),
                                    ("receipts", "snapshot", "'{}'::jsonb"),
                                    ("youpi_observations", "utr", "'OTHERUTR00001'")]:
            sql(f"update billing_private.{table} set {field}={value} where invoice_id={invoice_id}", ok=False)
            sql(f"delete from billing_private.{table} where invoice_id={invoice_id}", ok=False)
        sql(f"insert into billing_private.invoice_lines(invoice_id,position,description,quantity,rate_paise,line_total_paise) values ({invoice_id},99,'Injected',1,1,1)", ok=False)
        for table in ["invoices", "invoice_lines", "bank_credit_evidence", "audit_events", "receipts", "youpi_observations"]:
            sql(f"truncate billing_private.{table} cascade", ok=False)

    def test_18_no_unbacked_paid_or_reverse_transition(self):
        invoice = issue()
        invoice_id = literal(invoice["id"])
        sql(f"update billing_private.invoices set status='PAID' where id={invoice_id}", ok=False)
        sql(credit(invoice, 100), service=True)
        sql(f"update billing_private.invoices set status='UNPAID' where id={invoice_id}", ok=False)

    def test_19_read_and_write_rpc_privileges(self):
        invoice = issue()
        queries = ["select public.billing_list_invoices(25);",
                   "select public.billing_get_invoice(" + literal(invoice["id"]) + "::uuid);",
                   "select public.billing_get_receipt(" + literal(invoice["id"]) + "::uuid);",
                   credit(invoice, 10), observation(invoice)]
        for role in ["anon", "authenticated"]:
            for query in queries:
                sql(f"set role {role}; set request.jwt.claim.role='service_role'; " + query, ok=False)
        self.assertEqual(sql("select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace "
                             "where n.nspname='public' and p.proname like 'billing_%' and p.prosecdef "
                             "and 'search_path=pg_catalog, pg_temp'=any(p.proconfig);"), "6")


    def test_20_prepared_hosted_catalog_acceptance_detects_disabled_rls(self):
        check = (ROOT / 'tests' / 'staging' / 'catalog-acceptance.sql').read_text(encoding='utf-8')
        self.assertEqual(sql(check), 't|t|t|t|t|t')
        # Fault injection in THIS disposable synthetic database only.
        sql('alter table billing_private.invoices disable row level security;')
        try:
            self.assertEqual(sql(check), 't|f|t|t|t|t')
        finally:
            sql('alter table billing_private.invoices enable row level security;')


class Phase28Links(unittest.TestCase):
    merchant = '22222222-2222-4222-8222-222222222222'

    def reserve(self, invoice, actor=None, merchant=None):
        return "select public.billing_youpi_link_reserve(" + ','.join([
            literal(invoice['id'])+'::uuid', literal(merchant or self.merchant)+'::uuid',
            literal(actor or str(uuid.uuid4()))+'::uuid']) + ');'

    def complete(self, invoice, payment, digest):
        return "select public.billing_youpi_link_complete(" + ','.join([
            literal(invoice['id'])+'::uuid', literal(self.merchant)+'::uuid',
            literal(payment)+'::uuid', literal(digest)]) + ');'

    def test_01_concurrent_reservation_and_pending_timeout(self):
        invoice = issue()
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _: json.loads(sql(self.reserve(invoice), service=True)), range(8)))
        self.assertEqual(sum(r['decision']=='CREATE' for r in results), 1)
        self.assertEqual(sum(r['decision']=='BLOCKED' for r in results), 7)
        # A pending/ambiguous gateway request is never automatically reclaimed.
        self.assertEqual(json.loads(sql(self.reserve(invoice), service=True))['decision'], 'BLOCKED')

    def test_02_reuse_revoke_and_no_receipts(self):
        invoice, payment, digest = issue(), str(uuid.uuid4()), uuid.uuid4().hex*2
        sql(self.reserve(invoice), service=True)
        self.assertEqual(sql(self.complete(invoice,payment,digest), service=True), 't')
        self.assertEqual(json.loads(sql(self.reserve(invoice), service=True))['paymentId'], payment)
        self.assertEqual(sql(self.complete(invoice,str(uuid.uuid4()),digest), service=True), 'f')
        access = 'select public.billing_youpi_link_access('+literal(digest)+');'
        self.assertEqual(sql(access, service=True), 't')
        sql('select public.billing_get_receipt('+literal(invoice['id'])+'::uuid);', service=True, ok=False)
        self.assertEqual(sql('select public.billing_youpi_link_revoke('+literal(invoice['id'])+'::uuid,'+literal(ACTOR)+'::uuid);', service=True), 't')
        self.assertEqual(sql(access, service=True), 'f')
        self.assertEqual(json.loads(sql(self.reserve(invoice), service=True))['decision'], 'BLOCKED')

    def test_03_rate_limits_and_role_denial(self):
        invoice, actor = issue(), str(uuid.uuid4())
        for _ in range(10): sql(self.reserve(invoice,actor), service=True)
        self.assertEqual(json.loads(sql(self.reserve(invoice,actor), service=True))['decision'], 'RATE_LIMITED')
        for role in ['anon','authenticated']:
            sql(f"set role {role}; set request.jwt.claim.role='service_role'; "+self.reserve(invoice), ok=False)
            sql(f"set role {role}; select * from billing_private.youpi_links;", ok=False)
        sql(self.reserve(invoice), ok=False)

    def test_04_paid_invoice_and_wrong_merchant_deny(self):
        invoice, payment, digest = issue(), str(uuid.uuid4()), uuid.uuid4().hex*2
        sql(self.reserve(invoice), service=True)
        sql(self.complete(invoice,payment,digest), service=True)
        self.assertEqual(json.loads(sql(self.reserve(invoice,merchant=str(uuid.uuid4())), service=True))['decision'], 'BLOCKED')
        sql(credit(invoice,100), service=True)
        self.assertEqual(sql('select public.billing_youpi_link_access('+literal(digest)+');', service=True), 'f')
        self.assertEqual(json.loads(sql(self.reserve(invoice), service=True))['decision'], 'BLOCKED')

    def test_05_view_rate_limit_and_expiry(self):
        invoice, payment, digest = issue(), str(uuid.uuid4()), uuid.uuid4().hex*2
        sql(self.reserve(invoice), service=True)
        sql(self.complete(invoice,payment,digest), service=True)
        # One transaction fixes now() across all accesses, independent of minute rollover.
        answers = sql('begin; '+('select public.billing_youpi_link_access('+literal(digest)+');')*31+'commit;', service=True).splitlines()
        self.assertEqual(answers, ['t']*30+['f'])
        sql('update billing_private.youpi_links set issued_ms=1 where invoice_id='+literal(invoice['id'])+'::uuid;')
        self.assertEqual(sql('select public.billing_youpi_link_access('+literal(digest)+');', service=True), 'f')

    def test_06_linked_webhook_replay_and_wrong_merchant(self):
        invoice, payment, digest = issue(), str(uuid.uuid4()), uuid.uuid4().hex*2
        utr = uuid.uuid4().hex.upper()
        sql(self.reserve(invoice), service=True)
        sql(self.complete(invoice,payment,digest), service=True)
        def linked(merchant):
            return 'select public.billing_record_youpi_link_observation('+','.join([
                literal(invoice['id'])+'::uuid',literal(merchant)+'::uuid',literal(payment)+'::uuid',
                "'SUCCESS'",'100',literal(utr),literal(digest)])+');'
        self.assertTrue(json.loads(sql(linked(self.merchant),service=True))['recorded'])
        self.assertTrue(json.loads(sql(linked(self.merchant),service=True))['duplicate'])
        sql(linked(str(uuid.uuid4())),service=True,ok=False)
        sql('select public.billing_get_receipt('+literal(invoice['id'])+'::uuid);',service=True,ok=False)


class Phase30Claims(unittest.TestCase):
    def test_01_same_reference_concurrent_different_invoices(self):
        utr = uuid.uuid4().hex.upper()
        invoices = [issue() for _ in range(8)]
        def submit(invoice):
            try:
                return json.loads(sql(observation(invoice, utr=utr), service=True))['recorded']
            except AssertionError as error:
                self.assertIn('reference already bound', str(error))
                return False
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            self.assertEqual(sum(pool.map(submit, invoices)), 1)
        self.assertEqual(sql('select count(*) from billing_private.youpi_utr_claims where utr='+literal(utr)), '1')

    def test_02_stable_reference_across_payment_events(self):
        invoice, payment, utr = issue(), str(uuid.uuid4()), uuid.uuid4().hex.upper()
        for event in ['FAILED','SUCCESS']:
            self.assertTrue(json.loads(sql(observation(invoice,payment,event=event,utr=utr),service=True))['recorded'])
        sql(observation(invoice,payment,event='EXPIRED',utr=uuid.uuid4().hex.upper()),service=True,ok=False)
        sql('select public.billing_get_receipt('+literal(invoice['id'])+'::uuid);',service=True,ok=False)
        state = json.loads(sql('select public.billing_get_invoice('+literal(invoice['id'])+'::uuid);',service=True))
        self.assertEqual((state['status'],state['paidPaise']),('UNPAID',0))

    def test_03_immutable_private_claims(self):
        invoice, utr = issue(), uuid.uuid4().hex.upper()
        sql(observation(invoice,utr=utr),service=True)
        for role in ['anon','authenticated','service_role']:
            sql(f'set role {role}; select * from billing_private.youpi_utr_claims;',ok=False)
        for query in ['delete from billing_private.youpi_utr_claims',
                      "update billing_private.youpi_utr_claims set utr='CHANGEDUTR01' where utr="+literal(utr),
                      'truncate billing_private.youpi_utr_claims']:
            sql(query,ok=False)

    def test_04_claim_rolls_back_with_observation(self):
        invoice, utr = issue(), uuid.uuid4().hex.upper()
        sql('begin; '+SERVICE+observation(invoice,utr=utr)+' select 1/0; commit;',ok=False)
        self.assertEqual(sql('select count(*) from billing_private.youpi_utr_claims where utr='+literal(utr)), '0')
        self.assertTrue(json.loads(sql(observation(invoice,utr=utr),service=True))['recorded'])


class Phase31Manual(unittest.TestCase):
    beneficiary = '22222222-2222-4222-8222-222222222222'
    fingerprint = 'd'*64

    def reserve_query(self, invoice, fingerprint=None, actor=None):
        return 'select public.billing_manual_upi_reserve('+','.join([
            literal(invoice['id'])+'::uuid',literal(self.beneficiary)+'::uuid',"'synthetic@banktest'",
            "'Synthetic Merchant'","'synthetic-account'",literal(fingerprint or self.fingerprint),literal(actor or str(uuid.uuid4()))+'::uuid'])+');'

    def reserve(self, invoice):
        return json.loads(sql(self.reserve_query(invoice),service=True))

    def view_query(self, intent, fingerprint=None):
        return 'select public.billing_manual_upi_view('+literal(intent['intentId'])+'::uuid,'+str(intent['issuedAt'])+','+literal(fingerprint or self.fingerprint)+');'

    def review_query(self, invoice, intent, utr, booked, amount=100, fingerprint=None):
        return 'select public.billing_verify_manual_upi_credit('+','.join([
            literal(invoice['id'])+'::uuid',literal(intent['intentId'])+'::uuid',literal(fingerprint or self.fingerprint),
            literal(utr),str(amount),literal(booked)+'::timestamptz',"'SYNTHETIC OFFICIAL BANK RECORD ONLY'",literal(ACTOR)+'::uuid'])+');'

    def test_01_persistence_idempotency_and_private_instructions(self):
        invoice=issue(); intent=self.reserve(invoice)
        self.assertEqual(self.reserve(invoice),intent)
        view=json.loads(sql(self.view_query(intent),service=True))
        self.assertEqual((view['status'],view['bankVerified'],view['amountPaise']),('UNPAID',False,100))
        self.assertFalse(any(k in view for k in ['customer','bank_account_ref','evidence_reference']))
        self.assertEqual(sql(self.view_query(intent,'e'*64),service=True),'')
        # Every sql() invocation is a fresh psql process/session.
        self.assertEqual(json.loads(sql('select public.billing_manual_upi_admin_state('+literal(invoice['id'])+'::uuid,'+literal(self.fingerprint)+');',service=True))['intentId'],intent['intentId'])

    def test_02_concurrent_link_creation(self):
        invoice=issue()
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            values=list(pool.map(lambda _:self.reserve(invoice),range(8)))
        self.assertEqual(len(set(v['intentId'] for v in values)),1)

    def test_03_manual_exact_credit_and_single_receipt_on_concurrent_retry(self):
        invoice=issue(); intent=self.reserve(invoice); utr=uuid.uuid4().hex.upper()
        booked=sql('select clock_timestamp();')
        query=self.review_query(invoice,intent,utr,booked)
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            results=list(pool.map(lambda _:json.loads(sql(query,service=True)),range(4)))
        self.assertEqual(sum(not r['duplicate'] for r in results),1)
        self.assertTrue(all(r['status']=='PAID' for r in results))
        view=json.loads(sql(self.view_query(intent),service=True))
        self.assertTrue(view['bankVerified']);self.assertNotIn('vpa',view)
        self.assertEqual(sql('select count(*) from billing_private.receipts where invoice_id='+literal(invoice['id'])+'::uuid;'),'1')
        sql(self.review_query(invoice,intent,uuid.uuid4().hex.upper(),booked),service=True,ok=False)

    def test_04_amount_identity_and_legacy_settlement_bypass(self):
        invoice=issue(); intent=self.reserve(invoice); utr=uuid.uuid4().hex.upper(); booked=sql('select clock_timestamp();')
        for changes in [dict(amount=99),dict(fingerprint='e'*64)]:
            sql(self.review_query(invoice,intent,utr,booked,**changes),service=True,ok=False)
        sql(credit(invoice,100),service=True,ok=False)
        self.assertEqual(sql('select count(*) from billing_private.manual_upi_reviews where invoice_id='+literal(invoice['id'])+'::uuid;'),'0')
        sql('select public.billing_get_receipt('+literal(invoice['id'])+'::uuid);',service=True,ok=False)

    def test_05_duplicate_bank_reference_different_invoices(self):
        first,second=issue(),issue(); a,b=self.reserve(first),self.reserve(second)
        utr=uuid.uuid4().hex.upper(); booked=sql('select clock_timestamp();')
        sql(self.review_query(first,a,utr,booked),service=True)
        sql(self.review_query(second,b,utr.lower(),booked),service=True,ok=False)
        self.assertEqual(sql('select count(*) from billing_private.manual_upi_reviews where invoice_id='+literal(second['id'])+'::uuid;'),'0')

    def test_06_revoke_and_late_booked_credit(self):
        invoice=issue();intent=self.reserve(invoice)
        sql('select public.billing_manual_upi_revoke('+literal(invoice['id'])+'::uuid,'+literal(ACTOR)+'::uuid);',service=True)
        self.assertEqual(sql(self.view_query(intent),service=True),'')
        sql(self.reserve_query(invoice),service=True,ok=False)
        # Revocation cannot erase the financial obligation to review a real late credit.
        self.assertEqual(json.loads(sql(self.review_query(invoice,intent,uuid.uuid4().hex.upper(),sql('select clock_timestamp();')),service=True))['status'],'PAID')
        self.assertEqual(sql(self.view_query(intent),service=True),'')

    def test_07_roles_immutable_fields_and_rollback(self):
        invoice=issue();intent=self.reserve(invoice)
        for role in ['anon','authenticated']:
            sql(f'set role {role}; '+self.reserve_query(invoice),ok=False)
            sql(f'set role {role}; '+self.view_query(intent),ok=False)
        sql('update billing_private.manual_upi_intents set vpa=\'attacker@banktest\' where id='+literal(intent['intentId'])+'::uuid;',ok=False)
        query=self.review_query(invoice,intent,uuid.uuid4().hex.upper(),sql('select clock_timestamp();'))
        sql('begin; '+SERVICE+query+' select 1/0; commit;',ok=False)
        self.assertEqual(json.loads(sql(self.view_query(intent),service=True))['status'],'UNPAID')

    def test_08_no_competing_gateway_instructions_and_limits(self):
        invoice=issue();self.reserve(invoice)
        sql(Phase28Links().reserve(invoice),service=True,ok=False)
        other=issue();sql(Phase28Links().reserve(other),service=True)
        sql(self.reserve_query(other),service=True,ok=False)
        limited=issue();actor=str(uuid.uuid4())
        for _ in range(10):sql(self.reserve_query(limited,actor=actor),service=True)
        self.assertIn('rate limited',sql(self.reserve_query(limited,actor=actor),service=True,ok=False))


def atomic_bundle_drill():
    if not shutil.which('node'):
        raise AssertionError('Node is required for review-bundle verification')
    target='phase31_bundle_'+uuid.uuid4().hex
    sql(f'create database "{target}";',database='postgres')
    try:
        sql("create schema auth; create function auth.role() returns text language sql stable as $$ select nullif(current_setting('request.jwt.claim.role',true),'') $$; grant usage on schema auth to anon,authenticated,service_role;",database=target)
        with tempfile.TemporaryDirectory(prefix='phase31-review-') as folder:
            output=Path(folder)/'review.sql'
            subprocess.run(['node',str(ROOT/'scripts/prepare-billing-pilot-sql.mjs'),'--write',str(output)],capture_output=True,check=True,timeout=30)
            bundle=output.read_text()
        # A failure at the final statement must undo ALL eight prerequisite scripts.
        sql(bundle.rsplit('commit;',1)[0]+'select 1/0; commit;',database=target,ok=False)
        self_check="select to_regnamespace('billing_private') is null;"
        assert sql(self_check,database=target)=='t'
        sql(bundle,database=target)
        assert sql("select to_regprocedure('public.billing_manual_upi_view(uuid,bigint,text)') is not null;",database=target)=='t'
        sql(bundle,database=target,ok=False)
        assert sql("select to_regprocedure('public.billing_manual_upi_view(uuid,bigint,text)') is not null;",database=target)=='t'
        print('PASS native atomic eight-script bundle: failure rolls back all billing objects; repeat install refuses overwrite')
    finally:
        sql(f'drop database "{target}";',database='postgres')


def recovery_drill():
    container=os.environ.get('BILLING_PG_CONTAINER','')
    if not container:
        print('NOT EXECUTED: native dump/restore drill requires disposable CI PostgreSQL container')
        return
    if not all(c in 'abcdef0123456789' for c in container) or not 12<=len(container)<=64:
        raise AssertionError('Invalid disposable container identity')
    archive=subprocess.run(['docker','exec',container,'pg_dump','-U','postgres','-d',DB,'-Fc'],capture_output=True,check=True,timeout=30).stdout
    recovered='phase31_restore_'+uuid.uuid4().hex
    sql(f'create database "{recovered}";',database='postgres')
    try:
        subprocess.run(['docker','exec','-i',container,'pg_restore','-U','postgres','-d',recovered,'--exit-on-error'],input=archive,capture_output=True,check=True,timeout=30)
        counts="select (select count(*) from billing_private.invoices),(select count(*) from billing_private.manual_upi_intents),(select count(*) from billing_private.bank_credit_evidence),(select count(*) from billing_private.receipts);"
        assert sql(counts)==sql(counts,database=recovered)
        for table in ['invoices','invoice_lines','manual_upi_intents','manual_upi_reviews','bank_credit_evidence','receipts','audit_events']:
            digest="select md5(coalesce(string_agg(v,'|' order by v),'')) from (select to_jsonb(t)::text v from billing_private."+table+" t) s;"
            assert sql(digest)==sql(digest,database=recovered)
        sql("update billing_private.manual_upi_intents set payee_name='ATTACKER';",database=recovered,ok=False)
        print('PASS native synthetic pg_dump/restore: all seven ledger table digests match; immutable trigger preserved')
    finally:
        sql(f'drop database "{recovered}";',database='postgres')


def main():
    if ENV["PGHOST"] not in ("127.0.0.1", "localhost", "::1"):
        sys.exit("NOT EXECUTED: only a local disposable database is permitted")
    if os.environ.get("BILLING_PG_DISPOSABLE") != "1" or not shutil.which("psql"):
        sys.exit("NOT EXECUTED: requires psql and BILLING_PG_DISPOSABLE=1 on a disposable local cluster")
    # Cluster roles may already exist. Never modify existing role definitions.
    sql("do $$ begin " + " ".join(
        f"if not exists(select 1 from pg_roles where rolname='{role}') then create role {role} nologin; end if;"
        for role in ["anon", "authenticated", "service_role"]
    ) + " end $$;", database="postgres")
    sql(f'create database "{DB}";', database="postgres")
    try:
        sql("create schema auth; create function auth.role() returns text language sql stable as "
            "$$ select nullif(current_setting('request.jwt.claim.role',true),'') $$; "
            "grant usage on schema auth to anon, authenticated, service_role;")
        for name in ["012_billing_private_review.sql", "013_invoice_create_rpc_REVIEW_ONLY.sql",
                     "014_slice_settlement_rpc_REVIEW_ONLY.sql", "015_admin_invoice_read_rpc_REVIEW_ONLY.sql",
                     "016_youpi_observation_rpc_REVIEW_ONLY.sql"]:
            sql((ROOT / "docs" / "billing" / name).read_text(encoding="utf-8"))
            print("APPLIED LOCAL ONLY:", name)
        result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(BillingPostgres))
        if result.wasSuccessful():
            sql((ROOT / 'docs/billing/PHASE28_LINK_LEDGER_REVIEW_ONLY.sql').read_text(encoding='utf-8'))
            print('APPLIED LOCAL ONLY: Phase28 link ledger')
            result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Phase28Links))
        if result.wasSuccessful():
            sql((ROOT / 'docs/billing/017_youpi_utr_claims_REVIEW_ONLY.sql').read_text(encoding='utf-8'))
            print('APPLIED LOCAL ONLY: Phase30 reference claims')
            result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Phase30Claims))
        if result.wasSuccessful():
            sql((ROOT / 'supabase/migrations/20261020144859_manual_upi_pilot.sql').read_text(encoding='utf-8'))
            print('APPLIED LOCAL ONLY: Phase31 manual UPI pilot')
            result = unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Phase31Manual))
        if result.wasSuccessful():
            atomic_bundle_drill()
            recovery_drill()
        return 0 if result.wasSuccessful() else 1
    finally:
        # DB is a locally generated constant, never an owner-supplied target.
        assert DB.startswith("phase17_test_") and len(DB) == 45
        sql(f'drop database "{DB}";', database="postgres")


if __name__ == "__main__":
    sys.exit(main())
