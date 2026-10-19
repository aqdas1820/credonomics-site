import importlib.util
import json
import os
from pathlib import Path
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('recovery', Path(__file__).with_name('recovery.py'))
r = importlib.util.module_from_spec(spec); spec.loader.exec_module(r)


def manifest():
    return dict(schemaVersion=1, format='app-scoped-custom-archive', sourcePostgresMajor=17,
                image=r.IMAGE, scope='phase24_fixture', archiveSha256='a'*64,
                rolesSha256='b'*64, expectedCatalogSha256='c'*64,
                externalDependenciesReviewed=True, managedSchemaDataRequired=False,
                encryptionRootKeyRequired=False, extensions={'pgcrypto':'1.3'}, expectedCounts={'documents':2})


class RecoverySafety(unittest.TestCase):
    def test_reviewed_manifest(self):
        self.assertEqual(r.validate_manifest(manifest())['scope'], 'phase24_fixture')

    def test_raw_complete_dump_rejected(self):
        m=manifest(); m['format']='raw-full-pgdump'
        with self.assertRaises(r.Blocked): r.validate_manifest(m)

    def test_managed_schemas_rejected(self):
        for scope in ['auth','storage','public','vault','cron','pgsodium','extensions','net','x; drop schema auth']:
            with self.subTest(scope=scope), self.assertRaises(r.Blocked):
                r.validate_manifest({**manifest(),'scope':scope})

    def test_missing_independent_hashes_rejected(self):
        for field in ['archiveSha256','rolesSha256','expectedCatalogSha256']:
            with self.subTest(field=field), self.assertRaises(r.Blocked):
                r.validate_manifest({**manifest(),field:'not-a-hash'})

    def test_unresolved_dependencies_rejected(self):
        for field,value in [('externalDependenciesReviewed',False),('managedSchemaDataRequired',True),('encryptionRootKeyRequired',True)]:
            with self.subTest(field=field), self.assertRaises(r.Blocked):
                r.validate_manifest({**manifest(),field:value})

    def test_versions_and_active_extensions_rejected(self):
        for changes in [{'sourcePostgresMajor':15},{'image':'supabase/postgres:latest'}, {'extensions':{'pg_net':'0.19'}}, {'extensions':{'supabase_vault':'0.3.1'}}]:
            with self.subTest(changes=changes), self.assertRaises(r.Blocked): r.validate_manifest({**manifest(),**changes})

    def test_counts_are_strict(self):
        for counts in [{},{'t':True},{'t':-1},{'t;select':0}]:
            with self.subTest(counts=counts), self.assertRaises(r.Blocked): r.validate_manifest({**manifest(),'expectedCounts':counts})

    def test_log_classification_never_echoes_payload(self):
        secret='SYNTHETIC-DO-NOT-ECHO'
        result=r.classify_log('ERROR: schema "auth" does not exist\nCONTEXT: '+secret+'\nERROR: role "'+secret+'" does not exist\nERROR: function auth.uid() does not exist\n')
        self.assertEqual(result['auth_schema_missing'],1)
        self.assertEqual(result['auth_function_missing'],1)
        self.assertEqual(result['role_missing'],1)
        self.assertNotIn(secret,json.dumps(result))

    def test_error_categories(self):
        result=r.classify_log('extension "vector" is not available\npermission denied\nrelation "x" does not exist\nunrecognized configuration parameter "x"\nrelation "x" already exists')
        for key in ['extension_unavailable','privilege_or_owner','relation_or_order','version_mismatch','duplicate_object']:
            self.assertEqual(result[key],1)

    def test_actual_restore_refused_in_ci_before_file_reads(self):
        class Args: vault_confirmed=True; host_memory_protected=True; authorize_local_restore=True
        with patch.dict(os.environ, {'CI':'true'}), patch.object(r,'private_path') as read:
            with self.assertRaises(r.Blocked): r.actual(Args())
            read.assert_not_called()

    def test_actual_restore_needs_all_attestations(self):
        class Args: vault_confirmed=False; host_memory_protected=True; authorize_local_restore=True
        with self.assertRaises(r.Blocked): r.actual(Args())

    def test_non_vault_path_refused(self):
        with self.assertRaises(r.Blocked): r.private_path('C:/unencrypted/dump.sql')

    def test_scoped_toc(self):
        r.validate_toc('; SYNTHETIC\n1; 2615 1 SCHEMA - fixture owner\n2; 1259 2 TABLE fixture t owner\n3; 0 2 TABLE DATA fixture t owner', 'fixture')

    def test_toc_scope_and_unknown_records(self):
        for extra in ['2; 1 1 TABLE auth users owner','2; 1 1 EXTENSION - pgcrypto owner','unparsed','2; 1 1 SCHEMA - fixture owner']:
            with self.subTest(extra=extra), self.assertRaises(r.Blocked):
                r.validate_toc('1; 2615 1 SCHEMA - fixture owner\n'+extra,'fixture')


if __name__=='__main__': unittest.main()
