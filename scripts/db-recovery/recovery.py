"""Offline recovery validation. No hosted DB connection or credential inputs.

Only synthetic mode may run in CI. Actual inputs/logs remain on confirmed R:.
The official image supplies auth functions: this module never creates substitutes.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
import tempfile
import time
import uuid

ROOT = Path(__file__).resolve().parent
IMAGE = 'supabase/postgres:17.6.1.136@sha256:f371b5f3f2ac0a05703f33d6e6134515fb2498cab708fb948a0aeb7481467c00'
LABEL = 'org.credonomics.phase24'


class Blocked(Exception):
    pass


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def classify_log(text):
    """Output only categories/counts. Never forward matched text or SQL context."""
    patterns = {
        'auth_schema_missing': r'schema ["\']auth["\'] does not exist',
        'auth_function_missing': r'function auth\.(?:uid|role|jwt)\([^\n]*does not exist',
        'role_missing': r'role ["\'][^\r\n]+["\'] does not exist',
        'extension_unavailable': r'extension [^\r\n]*(?:not available|could not open)|could not open extension control file',
        'privilege_or_owner': r'permission denied|must be (?:owner|superuser)|must be able to SET ROLE',
        'duplicate_object': r'already exists',
        'relation_or_order': r'relation [^\r\n]+ does not exist|violates foreign key constraint',
        'version_mismatch': r'unrecognized configuration parameter|unsupported version .*file header',
        'restore_errors': r'(?:ERROR|FATAL):|errors ignored on restore:',
    }
    return {key: len(re.findall(p, text, re.I)) for key, p in patterns.items()}


def private_path(path):
    p = Path(path)
    if os.name != 'nt' or p.drive.upper() != 'R:' or not p.is_absolute():
        raise Blocked('Actual backup paths must be absolute on mounted encrypted R:')
    # Check every ancestor before resolve: a junction must not escape encrypted storage.
    for item in (p, *p.parents):
        if item.is_symlink() or (hasattr(item, 'is_junction') and item.is_junction()):
            raise Blocked('Linked private path refused')
    if p.resolve().drive.upper() != 'R:':
        raise Blocked('Private path escaped encrypted drive')
    return p


def validate_manifest(m):
    if m.get('schemaVersion') != 1 or m.get('format') != 'app-scoped-custom-archive':
        raise Blocked('Unknown/raw/complete dump format requires a separate compatibility plan')
    if m.get('sourcePostgresMajor') != 17 or m.get('image') != IMAGE:
        raise Blocked('Unreviewed PostgreSQL/image version')
    if not re.fullmatch(r'[a-z][a-z0-9_]{0,62}', m.get('scope', '')) or m['scope'] in (
            'auth', 'storage', 'extensions', 'vault', 'pgsodium', 'cron', 'net', 'public'):
        raise Blocked('A dedicated reviewed application schema is required')
    for key in ('archiveSha256', 'expectedCatalogSha256', 'rolesSha256'):
        if not re.fullmatch(r'[a-f0-9]{64}', m.get(key, '')):
            raise Blocked('Missing independent archive/role/catalog digest')
    if m.get('externalDependenciesReviewed') is not True or m.get('managedSchemaDataRequired') is not False:
        raise Blocked('Unresolved managed-schema dependencies')
    if m.get('encryptionRootKeyRequired') is not False:
        raise Blocked('Encryption-key recovery requires separate private custody procedure')
    if not isinstance(m.get('extensions'), dict) or not all(
        re.fullmatch(r'[a-zA-Z0-9_-]+', k) and re.fullmatch(r'[0-9][0-9a-zA-Z.\-]*', v)
        for k, v in m['extensions'].items()
    ):
        raise Blocked('Invalid extension requirements')
    if set(m['extensions']) & {'pgsodium', 'supabase_vault', 'pg_net', 'pg_cron'}:
        raise Blocked('Active/key-dependent extensions need a separate reviewed plan')
    if not isinstance(m.get('expectedCounts'), dict) or not m['expectedCounts'] or not all(
        re.fullmatch(r'[a-z][a-z0-9_]{0,62}', k) and type(v) is int and v >= 0
        for k, v in m['expectedCounts'].items()
    ):
        raise Blocked('Independent table counts required')
    return m


def validate_toc(toc, scope):
    """Fail closed on out-of-scope/global/unknown TOC records; never edit a dump."""
    descriptions = ('SEQUENCE OWNED BY','TABLE DATA','SEQUENCE SET','FK CONSTRAINT',
                    'CHECK CONSTRAINT','DEFAULT ACL','ROW SECURITY','CONSTRAINT','TRIGGER',
                    'FUNCTION','PROCEDURE','SEQUENCE','TABLE','INDEX','POLICY','ACL','COMMENT','SCHEMA')
    schemas = 0
    for line in toc.splitlines():
        if not line.strip() or line.startswith(';'):
            continue
        match = re.fullmatch(r'\d+; \d+ \d+ (.+)', line)
        if not match:
            raise Blocked('Unrecognized archive TOC record')
        record = match[1]
        description = next((x for x in descriptions if record.startswith(x+' ')), None)
        if description is None:
            raise Blocked('Global/unsupported object in scoped archive')
        rest = record[len(description)+1:]
        if description == 'SCHEMA':
            if not rest.startswith('- '+scope+' '):
                raise Blocked('Wrong schema in archive')
            schemas += 1
        elif not rest.startswith(scope+' '):
            raise Blocked('Out-of-scope object in archive')
    if schemas != 1:
        raise Blocked('Exactly one scoped schema entry required')


class Docker:
    def __init__(self, logdir, *, synthetic=False):
        self.logdir = Path(logdir)
        self.logdir.mkdir(parents=True, exist_ok=True)
        self.serial = 0
        self.names = []
        self.runid = uuid.uuid4().hex
        self.synthetic = synthetic

    def run(self, args, *, data=None, source=None, output=None, ok=True):
        self.serial += 1
        # Command args are never printed; diagnostics (including SQL on failure) stay private.
        errpath = self.logdir / f'{self.serial:03d}.stderr'
        outpath = self.logdir / f'{self.serial:03d}.stdout'
        with open(errpath, 'xb') as err, open(output or outpath, 'xb') as out:
            if source:
                with open(source, 'rb') as inp:
                    p = subprocess.run(['docker', *args], stdin=inp, stdout=out, stderr=err, timeout=300)
            else:
                p = subprocess.run(['docker', *args], input=data, stdout=out, stderr=err, timeout=300)
        value = (Path(output) if output else outpath).read_bytes() if not output else b''
        if ok and p.returncode:
            raise Blocked(f'Local command failed; inspect private diagnostic step {self.serial}')
        return p.returncode, value

    def preflight(self):
        if any(os.environ.get(k) for k in ('DOCKER_HOST', 'DOCKER_CONTEXT', 'DOCKER_TLS_VERIFY', 'DOCKER_CERT_PATH')):
            raise Blocked('Docker endpoint overrides are not allowed')
        _, raw = self.run(['context', 'inspect'])
        endpoint = json.loads(raw)[0]['Endpoints']['docker']['Host']
        if endpoint not in ('unix:///var/run/docker.sock', 'npipe:////./pipe/docker_engine',
                            'npipe:////./pipe/dockerDesktopLinuxEngine'):
            raise Blocked('Only a local Docker engine is permitted')
        _, raw = self.run(['info', '--format', '{{json .}}'])
        info = json.loads(raw)
        if info['OSType'] != 'linux' or info['MemTotal'] < 3 * 1024**3:
            raise Blocked('Linux engine with at least 3 GiB RAM required')
        self.run(['image', 'inspect', IMAGE]) # No implicit pull, upgrade or remote service.

    def create(self):
        name = 'cn-phase24-' + uuid.uuid4().hex
        self.names.append(name)
        self.run(['run', '-d', '--name', name, '--label', f'{LABEL}={self.runid}',
                  '--pull=never', '--network=none', '--log-driver='+('local' if self.synthetic else 'none'), '--memory=2g', '--memory-swap=2g',
                  '--shm-size=256m', '--tmpfs', '/var/lib/postgresql/data:rw,size=1g',
                  '--tmpfs', '/tmp:rw,size=128m', '--tmpfs', '/var/log/postgresql:rw,size=64m',
                  '-e', 'POSTGRES_PASSWORD=' + secrets.token_hex(32), '-e', 'POSTGRES_DB=postgres',
                  IMAGE, 'postgres', '-c', 'config_file=/etc/postgresql/postgresql.conf',
                  '-c', 'listen_addresses=', '-c', 'logging_collector=off', '-c', 'log_statement=none',
                  '-c', 'log_min_error_statement=panic', '-c', 'cron.launch_active_jobs=off'])
        for _ in range(90):
            code, comm = self.run(['exec', name, 'cat', '/proc/1/comm'], ok=False)
            if code or comm.strip() != b'postgres':
                time.sleep(1)
                continue
            code, _ = self.run(['exec', name, 'pg_isready', '-U', 'supabase_admin', '-d', 'postgres'], ok=False)
            if code == 0:
                # Readiness alone is insufficient: initialization may still be applying migrations.
                code, raw = self.sql(name, "select to_regprocedure('auth.uid()') is not null and to_regprocedure('auth.jwt()') is not null;", ok=False)
                if code == 0 and raw.strip() == b't':
                    self.inspect(name)
                    return name
            time.sleep(1)
        raise Blocked('Official Supabase baseline did not become ready')

    def inspect(self, name):
        _, raw = self.run(['inspect', name])
        x = json.loads(raw)[0]
        if x['Config']['Labels'].get(LABEL) != self.runid or x['HostConfig']['NetworkMode'] != 'none' or x['HostConfig']['PortBindings']:
            raise Blocked('Container identity/network mismatch')
        if x['HostConfig']['LogConfig']['Type'] != ('local' if self.synthetic else 'none'):
            raise Blocked('Container log persistence refused')
        mounts = {m['Destination']: m['Type'] for m in x['Mounts']}
        if mounts.get('/var/lib/postgresql/data') != 'tmpfs' or any(t == 'bind' for t in mounts.values()):
            raise Blocked('Persistent PGDATA or host bind mount refused')

    def sql(self, name, text, *, ok=True, variables=()):
        return self.run(['exec', '-i', name, 'psql', '-XAtq', '-U', 'supabase_admin', '-d', 'postgres',
                         '-v', 'ON_ERROR_STOP=1', *variables], data=text.encode(), ok=ok)

    def baseline(self, name):
        _, settings = self.sql(name, "select current_setting('data_directory'),current_setting('logging_collector'),current_setting('archive_mode');")
        if settings.strip() != b'/var/lib/postgresql/data|off|off':
            raise Blocked('PostgreSQL data/log/archive storage configuration mismatch')
        _, raw = self.sql(name, """select json_build_object('major',current_setting('server_version_num')::int/10000,
          'functions',(select json_agg(pg_get_functiondef(p.oid) order by p.proname) from pg_proc p
          join pg_namespace n on n.oid=p.pronamespace where n.nspname='auth' and p.proname in ('uid','role','jwt')),
          'roles',(select json_object_agg(rolname,rolbypassrls) from pg_roles where rolname in ('anon','authenticated','service_role')),
          'extensions',(select json_object_agg(extname,extversion) from pg_extension));""")
        x = json.loads(raw)
        if x['major'] != 17 or len(x['functions'] or []) != 3 or x['roles'] != {'anon': False, 'authenticated': False, 'service_role': True}:
            raise Blocked('Genuine Supabase baseline requirements not met')
        return x

    def catalog(self, name, scope):
        _, raw = self.sql(name, (ROOT / 'catalog.sql').read_text(), variables=('-v', 'scope=' + scope))
        return hashlib.sha256(raw.strip()).hexdigest()

    def restore(self, name, archive):
        self.inspect(name)
        self.run(['exec', '-i', name, 'pg_restore', '-U', 'supabase_admin', '-d', 'postgres',
                  '--single-transaction', '--exit-on-error'], source=archive)

    def cleanup(self):
        for name in self.names:
            self.inspect(name) # Bound to this UUID + label; never prune/reuse an existing container.
            self.run(['rm', '-f', '-v', name])


def rls_checks(d, name):
    passed = 0
    for subject, expected in [('11111111-1111-4111-8111-111111111111', '101'),
                              ('22222222-2222-4222-8222-222222222222', '202')]:
        _, raw = d.sql(name, f"begin; set local role authenticated; set local request.jwt.claim.sub='{subject}'; select phase24_fixture.total_for_current_user(); rollback;")
        if raw.strip().decode() != expected:
            raise Blocked('Synthetic RLS owner isolation failed')
        passed += 1
    _, raw = d.sql(name, 'begin; set local role anon; select count(*) from phase24_fixture.documents; rollback;')
    if raw.strip() != b'0':
        raise Blocked('Synthetic anonymous isolation failed')
    passed += 1
    code, _ = d.sql(name, "begin; set local role authenticated; set local request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'; update phase24_fixture.documents set owner_id='22222222-2222-4222-8222-222222222222' where amount_paise=101; rollback;", ok=False)
    if code == 0:
        raise Blocked('Synthetic WITH CHECK restriction failed')
    passed += 1
    code, _ = d.sql(name, 'begin; set local role anon; select phase24_fixture.total_for_current_user(); rollback;', ok=False)
    if code == 0:
        raise Blocked('Synthetic function EXECUTE restriction failed')
    passed += 1
    return passed


def synthetic():
    with tempfile.TemporaryDirectory(prefix='cn-phase24-synthetic-') as tmp:
        d = Docker(tmp, synthetic=True)
        try:
            d.preflight()
            source = d.create(); target = d.create()
            for name in (source, target):
                d.baseline(name)
                d.sql(name, (ROOT / 'fixtures/auth-users.sql').read_text())
            d.sql(source, (ROOT / 'fixtures/schema.sql').read_text())
            expected = d.catalog(source, 'phase24_fixture')
            archive = Path(tmp) / 'synthetic.dump'
            d.run(['exec', source, 'pg_dump', '-U', 'supabase_admin', '-d', 'postgres', '-Fc', '--schema=phase24_fixture'], output=archive)
            _, toc = d.run(['exec', '-i', target, 'pg_restore', '--list'], source=archive)
            validate_toc(toc.decode(), 'phase24_fixture')
            # Data without schema cannot establish recovery; fail rather than disable checks.
            code, _ = d.run(['exec','-i',target,'pg_restore','-U','supabase_admin','-d','postgres',
                             '--data-only','--single-transaction','--exit-on-error'], source=archive, ok=False)
            if code == 0:
                raise Blocked('Data-before-schema negative test unexpectedly succeeded')
            # Exact reproduction: missing external role makes restoration fail atomically.
            code, _ = d.run(['exec', '-i', target, 'pg_restore', '-U', 'supabase_admin', '-d', 'postgres',
                             '--single-transaction', '--exit-on-error'], source=archive, ok=False)
            if code == 0:
                raise Blocked('Missing-role negative test unexpectedly succeeded')
            _, raw = d.sql(target, "select to_regnamespace('phase24_fixture') is null;")
            if raw.strip() != b't':
                raise Blocked('Failed restore was not atomic')
            before = d.baseline(target)
            d.sql(target, 'CREATE ROLE phase24_auditor NOLOGIN NOSUPERUSER NOBYPASSRLS;')
            # A template0 DB in the same genuine runtime has no platform schemas.
            # It must reject this dump; no replacement auth functions are installed.
            d.sql(target, 'CREATE DATABASE phase24_empty TEMPLATE template0;')
            code, _ = d.run(['exec','-i',target,'pg_restore','-U','supabase_admin','-d','phase24_empty',
                             '--single-transaction','--exit-on-error'], source=archive, ok=False)
            if code == 0:
                raise Blocked('Missing-auth negative test unexpectedly succeeded')
            last_error = (d.logdir / f'{d.serial:03d}.stderr').read_text(errors='replace')
            if classify_log(last_error)['auth_schema_missing'] == 0:
                raise Blocked('Missing-auth negative test did not reach expected dependency')
            code, _ = d.sql(target, 'CREATE EXTENSION phase24_nonexistent_extension;', ok=False)
            if code == 0:
                raise Blocked('Unavailable-extension negative test unexpectedly succeeded')
            code, _ = d.sql(target, 'begin; set local role anon; create schema phase24_denied; rollback;', ok=False)
            if code == 0:
                raise Blocked('Privilege negative test unexpectedly succeeded')
            d.restore(target, archive)
            if d.catalog(target, 'phase24_fixture') != expected or d.baseline(target) != before:
                raise Blocked('Restored catalog or platform baseline changed')
            checks = rls_checks(d, source) + rls_checks(d, target)
            _, raw = d.sql(target, "select count(*)=2 and sum(amount_paise)=303 from phase24_fixture.documents;")
            if raw.strip() != b't':
                raise Blocked('Synthetic row/amount mismatch')
            _, raw = d.sql(target, "insert into phase24_fixture.documents(owner_id,amount_paise,note) values ('11111111-1111-4111-8111-111111111111',303,'SYNTHETIC SEQUENCE') returning id;")
            if raw.strip() != b'3':
                raise Blocked('Restored sequence mismatch')
            print(json.dumps({'synthetic': 'PASS', 'rlsAssertions': checks, 'catalog': 'MATCH',
                              'authBaseline': 'UNCHANGED', 'missingRoleRollback': 'PASS',
                              'missingAuth': 'PASS', 'dataBeforeSchema': 'PASS', 'extensionAndPrivilegeDenials': 'PASS',
                              'rowsAndSequence': 'PASS', 'image': IMAGE}))
        except Blocked as exc:
            print('Synthetic failure: ' + str(exc), file=sys.stderr)
            diagnostics = '\n'.join(p.read_text(errors='replace') for p in Path(tmp).glob('*.stderr'))
            print(json.dumps(classify_log(diagnostics)), file=sys.stderr)
            # This path is reachable only with generated fixtures, never an actual backup.
            for name in d.names:
                _, logs = d.run(['logs','--tail','45',name], ok=False)
                stderr = (d.logdir / f'{d.serial:03d}.stderr').read_bytes()
                print((logs+stderr).decode(errors='replace')[-5000:], file=sys.stderr)
            raise
        finally:
            d.cleanup()


def actual(args):
    if any(os.environ.get(k) for k in ('CI', 'GITHUB_ACTIONS')) or not args.vault_confirmed or not args.host_memory_protected or not args.authorize_local_restore:
        raise Blocked('Actual restore requires a private operator session and explicit safety attestations')
    manifest = private_path(args.manifest)
    m = validate_manifest(json.loads(manifest.read_text(encoding='utf-8')))
    archive = private_path(m['archive']); roles = private_path(m['roles'])
    if sha(archive) != m['archiveSha256'] or sha(roles) != m['rolesSha256']:
        raise Blocked('Input SHA-256 mismatch')
    workspace = private_path(args.workspace)
    workspace.mkdir(parents=True, exist_ok=False) # Never reuse/overwrite a previous attempt.
    d = Docker(workspace)
    try:
        d.preflight(); name = d.create(); baseline = d.baseline(name)
        _, toc = d.run(['exec', '-i', name, 'pg_restore', '--list'], source=archive)
        validate_toc(toc.decode(), m['scope'])
        if any(baseline['extensions'].get(k) != v for k, v in m['extensions'].items()):
            raise Blocked('Extension versions do not match reviewed source requirements')
        # Roles SQL must be independently reviewed, app-only, no platform roles/functions.
        # This tool does not regex-rewrite SQL or ignore a failed ownership/ACL operation.
        d.run(['exec','-i',name,'psql','-X','-U','supabase_admin','-d','postgres','-v','ON_ERROR_STOP=1','--single-transaction'], source=roles)
        d.restore(name, archive)
        if d.catalog(name, m['scope']) != m['expectedCatalogSha256'] or d.baseline(name) != baseline:
            raise Blocked('Catalog/platform baseline mismatch')
        for table, expected in m['expectedCounts'].items():
            _, raw = d.sql(name, f'SELECT count(*) FROM "{m["scope"]}"."{table}";')
            if raw.strip() != str(expected).encode():
                raise Blocked('Private row-count mismatch')
        if sha(archive) != m['archiveSha256'] or sha(roles) != m['rolesSha256']:
            raise Blocked('Input changed during validation')
        result = {'scope': 'APPLICATION_DATABASE_ONLY', 'restore': 'PASS', 'catalog': 'MATCH',
                  'counts': 'MATCH', 'platformBaseline': 'UNCHANGED', 'image': IMAGE,
                  'fullSupabaseRecovery': 'NOT_VERIFIED', 'authHttpE2E': 'NOT_RUN'}
        (workspace/'result.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
        print('PASS scoped local restore; private evidence retained on R:. Full Supabase recovery remains unverified.')
    finally:
        d.cleanup()


def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest='mode', required=True)
    sub.add_parser('synthetic')
    a = sub.add_parser('restore')
    a.add_argument('--manifest', required=True); a.add_argument('--workspace', required=True)
    for flag in ('vault-confirmed', 'host-memory-protected', 'authorize-local-restore'):
        a.add_argument('--'+flag, action='store_true')
    l = sub.add_parser('classify-log'); l.add_argument('--log', required=True)
    args = p.parse_args()
    if args.mode == 'synthetic':
        synthetic()
    elif args.mode == 'restore':
        actual(args)
    else:
        log = private_path(args.log)
        print(json.dumps(classify_log(log.read_text(encoding='utf-8-sig', errors='replace'))))


if __name__ == '__main__':
    try:
        main()
    except (Blocked, OSError, ValueError, KeyError, subprocess.SubprocessError):
        # Do not stringify exceptions: input paths/SQL/errors may contain sensitive data.
        print('BLOCKED: local validation incomplete; inspect private prerequisites/diagnostics.', file=sys.stderr)
        sys.exit(1)
