"""Owner-run native PG17 recovery. Private data never leaves the mounted VeraCrypt vault.
No hosted writes, credential reset, filtered dumps, or permission/trigger shortcuts.
"""
import argparse
import ctypes
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import socket
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
REF = re.compile(r'^[a-z0-9]{20}$')

def digest(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for part in iter(lambda: f.read(1024 * 1024), b''): h.update(part)
    return h.hexdigest()

def validate_profile(p):
    ref = p.get('projectRef', '')
    if not REF.fullmatch(ref): raise ValueError('Invalid project ref')
    if p.get('environment') not in ('staging', 'production'): raise ValueError('Explicit environment required')
    # Copy a session-pooler hostname from this project's Connect dashboard, never guess it.
    direct = p.get('host') == f'db.{ref}.supabase.co' and p.get('user') == 'postgres'
    pooler = bool(re.fullmatch(r'aws-[0-9]+-ap-south-1\.pooler\.supabase\.com',p.get('host',''))) and p.get('user') == f'postgres.{ref}'
    if not (direct or pooler) or p.get('port') != 5432 or p.get('database') != 'postgres':
        raise ValueError('Use exact project direct/session endpoint, port 5432 and existing postgres credentials')
    if ref == 'jvpiulmcjjnsgozgqgzw' and p['environment'] != 'staging':
        raise ValueError('Known staging project cannot be relabeled production')
    return p

def vault_path(value):
    if os.name != 'nt': raise ValueError('Owner Windows environment required')
    path = Path(value).absolute()
    if path.drive.upper() != 'R:': raise ValueError('Only owner mounted R: vault is allowed')
    buf = ctypes.create_unicode_buffer(4096)
    if not ctypes.windll.kernel32.QueryDosDeviceW('R:', buf, len(buf)) or not buf.value.startswith('\\Device\\VeraCryptVolume'):
        raise ValueError('R: is not a verified VeraCrypt device')
    for part in [path, *path.parents]:
        if part.exists() and part.stat().st_file_attributes & 0x400:
            raise ValueError('Reparse points are forbidden')
    return path

def environment(host, port, user, password_file, readonly=False):
    env = {k:v for k,v in os.environ.items() if not k.upper().startswith('PG')}
    env.update(PGHOST=host, PGPORT=str(port), PGUSER=user, PGDATABASE='postgres',
               PGPASSFILE=str(password_file), PGCONNECT_TIMEOUT='20', PGAPPNAME='credonomics-owner-recovery',
               PGSSLMODE='verify-full' if readonly else 'disable')
    if readonly: env.update(PGSSLROOTCERT='system', PGOPTIONS='-c default_transaction_read_only=on -c statement_timeout=300000')
    return env

def passfile(path, host, port, user, password):
    def escape(s): return s.replace('\\', '\\\\').replace(':', '\\:')
    if '\n' in password or '\r' in password: raise ValueError('Unsupported password characters')
    path.write_text(f'{escape(host)}:{port}:*:{escape(user)}:{escape(password)}\n', encoding='utf-8')
    account = subprocess.check_output(['whoami'], text=True).strip()
    subprocess.run(['icacls', str(path), '/inheritance:r', '/grant:r', f'{account}:F'], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

class Runner:
    def __init__(self, bin_dir, workspace, env):
        self.bin = Path(bin_dir); self.workspace = workspace; self.env = env; self.seq = 0
    def run(self, program, *args, stream_hash=False, input_bytes=None):
        self.seq += 1
        with open(self.workspace / f'command-{self.seq:03}.stderr', 'xb') as err:
            proc = subprocess.Popen([str(self.bin / (program + '.exe')), *map(str,args)], env=self.env, stdout=subprocess.PIPE, stderr=err, stdin=subprocess.PIPE if input_bytes is not None else subprocess.DEVNULL, creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
            if input_bytes is not None:
                proc.stdin.write(input_bytes); proc.stdin.close()
            if stream_hash:
                h = hashlib.sha256(); count = 0
                for line in proc.stdout: h.update(line); count += 1
                output = {'sha256':h.hexdigest(),'rows':count}
            else: output = proc.stdout.read()
            proc.stdout.close()
            if proc.wait() != 0: raise ValueError('Native command failed; inspect private vault diagnostics')
            return output
    def sql(self, query, **kw): return self.run('psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-c', query, **kw)

def inventory(r):
    schemas = json.loads(r.sql("select coalesce(json_agg(nspname order by nspname),'[]') from pg_namespace where nspname not like 'pg_%' and nspname <> 'information_schema'"))
    result = {'catalog':{}, 'rows':{}}
    result['database'] = json.loads(r.sql("select json_build_object('owner',pg_get_userbyid(datdba),'acl',datacl::text,'encoding',pg_encoding_to_char(encoding),'collate',datcollate,'ctype',datctype,'localeProvider',datlocprovider,'collationVersion',datcollversion,'connectionLimit',datconnlimit) from pg_database where datname=current_database()"))
    result['databaseRoleSettings'] = json.loads(r.sql("select coalesce(json_agg(json_build_array(coalesce(p.rolname,'ALL'),s.setconfig) order by p.rolname),'[]') from pg_db_role_setting s left join pg_roles p on p.oid=s.setrole where s.setdatabase=(select oid from pg_database where datname=current_database())"))
    result['defaultPrivileges'] = json.loads(r.sql("select coalesce(json_agg(json_build_array(pg_get_userbyid(a.defaclrole),coalesce(n.nspname,'ALL'),a.defaclobjtype,a.defaclacl::text) order by a.defaclrole::regrole::text,n.nspname,a.defaclobjtype),'[]') from pg_default_acl a left join pg_namespace n on n.oid=a.defaclnamespace"))
    result['eventTriggers'] = json.loads(r.sql("select coalesce(json_agg(json_build_array(evtname,evtevent,evtenabled,evttags,evtfoid::regprocedure::text,pg_get_userbyid(evtowner)) order by evtname),'[]') from pg_event_trigger"))
    result['triggerState'] = json.loads(r.sql("select coalesce(json_agg(json_build_array(n.nspname,c.relname,t.tgname,t.tgenabled,t.tgisinternal) order by n.nspname,c.relname,t.tgname),'[]') from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname not like 'pg_%'"))
    for schema in schemas:
        raw = r.run('psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v',f'scope={schema}','-f',ROOT/'catalog.sql')
        result['catalog'][schema] = hashlib.sha256(raw.strip()).hexdigest()
    tables = json.loads(r.sql("select coalesce(json_agg(json_build_array(n.nspname,c.relname) order by n.nspname,c.relname),'[]') from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind in ('r','m') and n.nspname not like 'pg_%' and n.nspname <> 'information_schema'"))
    for schema, table in tables:
        ident = '.'.join('"'+x.replace('"','""')+'"' for x in (schema,table))
        # Ordered JSON row stream is hashed without writing customer/Auth rows into logs.
        result['rows'][f'{schema}.{table}'] = r.sql(f'SELECT to_jsonb(t)::text FROM {ident} t ORDER BY to_jsonb(t)::text',stream_hash=True)
    result['extensions'] = json.loads(r.sql("select coalesce(json_agg(json_build_array(extname,extversion,nspname) order by extname),'[]') from pg_extension e join pg_namespace n on n.oid=e.extnamespace"))
    result['sequences'] = json.loads(r.sql("select coalesce(json_agg(to_jsonb(s) order by schemaname,sequencename),'[]') from pg_sequences s where schemaname not like 'pg_%'"))
    result['roles'] = json.loads(r.sql("select coalesce(json_agg(json_build_array(rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil,rolconfig) order by rolname),'[]') from pg_roles where rolname not like 'cn_restore_%'"))
    result['memberships'] = json.loads(r.sql("select coalesce(json_agg(json_build_array(r.rolname,m.rolname,g.rolname,a.admin_option,a.inherit_option,a.set_option) order by r.rolname,m.rolname,g.rolname),'[]') from pg_auth_members a join pg_roles r on r.oid=a.roleid join pg_roles m on m.oid=a.member join pg_roles g on g.oid=a.grantor where r.rolname not like 'cn_restore_%' and m.rolname not like 'cn_restore_%' and g.rolname not like 'cn_restore_%'"))
    return result

def save(path, obj):
    with open(path,'x',encoding='utf-8') as f: json.dump(obj,f,indent=2,sort_keys=True)

def export(args):
    p = validate_profile(json.loads(Path(args.profile).read_text(encoding='utf-8-sig')))
    dest = vault_path(args.workspace)
    if not args.writers_quiesced or not args.vault_confirmed: raise ValueError('Owner must attest encrypted vault custody and quiesced application writers')
    dest.mkdir(parents=False,exist_ok=False)
    password_file = dest/'connection.pgpass'
    try:
        passfile(password_file,p['host'],p['port'],p['user'],getpass.getpass('Existing database password (never reset): '))
        r = Runner(args.pg_bin,dest,environment(p['host'],p['port'],p['user'],password_file,True))
        version = r.run('pg_dump','--version').decode()
        if not re.search(r'\b17\.',version) or r.sql('show server_version_num').strip()[:2] != b'17': raise ValueError('Both source and installed native tools must be PG17')
        before = inventory(r)
        r.run('pg_dumpall','--roles-only','--no-role-passwords','--file',dest/'roles.sql')
        r.run('pg_dump','--format=custom','--serializable-deferrable','--file',dest/'database.dump')
        after = inventory(r)
        if before != after: raise ValueError('Source changed during export; preserve failed attempt and retry after writers stop')
        r.run('pg_restore','--list',dest/'database.dump')
        save(dest/'manifest.json',{'version':1,'identity':p,'client':version.strip(),'inventory':before,
             'files':{n:digest(dest/n) for n in ('roles.sql','database.dump')},
             'recovery':'NOT_TESTED','scope':'complete native database + password-free roles; external files/keys/OAuth excluded'})
        print('Export hash/inventory checks passed. Real recovery remains NOT_TESTED until isolated restoration passes.')
    finally:
        password_file.unlink(missing_ok=True)

def restore(args):
    source = vault_path(args.backup); dest = vault_path(args.workspace)
    if not all((args.authorize_local_restore,args.network_disconnected,args.host_memory_protected,args.vault_confirmed,args.roles_reviewed)):
        raise ValueError('Local restore approval, reviewed roles, disconnected network, encrypted/protected memory and vault attestations required')
    manifest = json.loads((source/'manifest.json').read_text(encoding='utf-8'))
    validate_profile(manifest['identity'])
    for name in ('roles.sql','database.dump'):
        if digest(source/name) != manifest['files'][name]: raise ValueError('Backup integrity mismatch')
    dest.mkdir(parents=False,exist_ok=False)
    localuser='cn_restore_'+secrets.token_hex(8); password=secrets.token_hex(32)
    with socket.socket() as sock: sock.bind(('127.0.0.1',0)); port=sock.getsockname()[1]
    pf=dest/'connection.pgpass'; pgdata=dest/'pgdata'
    started=False
    try:
        passfile(pf,'127.0.0.1',port,localuser,password)
        r=Runner(args.pg_bin,dest,environment('127.0.0.1',port,localuser,pf))
        if not re.search(rb'\b17\.',r.run('pg_restore','--version')): raise ValueError('Native PG17 required')
        r.run('initdb','-D',pgdata,'-U',localuser,'--pwprompt','--auth-host=scram-sha-256','--auth-local=scram-sha-256','--encoding=UTF8','--no-locale',input_bytes=((password+'\n')*2).encode())
        started=True
        r.run('pg_ctl','-D',pgdata,'-l',dest/'server.log','-o',f'-h 127.0.0.1 -p {port} -c shared_preload_libraries= -c archive_mode=off -c max_wal_senders=0','-w','start')
        r.run('psql','-X','-v','ON_ERROR_STOP=1','-f',source/'roles.sql')
        # New empty database, not an initialized Supabase baseline. Never --clean/disable-triggers/no-owner/no-acl.
        r.sql('CREATE DATABASE recovered TEMPLATE template0')
        r.env['PGDATABASE']='recovered'
        r.run('pg_restore','--single-transaction','--exit-on-error','--dbname=recovered',source/'database.dump')
        owner=manifest['inventory']['database']['owner'].replace(chr(34),chr(34)*2)
        r.sql('ALTER DATABASE recovered OWNER TO '+chr(34)+owner+chr(34))
        actual=inventory(r)
        if actual != manifest['inventory']: raise ValueError('Restored catalog/rows/sequences/roles/extensions differ; recovery BLOCKED')
        for name,expected in manifest['files'].items():
            if digest(source/name) != expected: raise ValueError('Source archive changed')
        save(dest/'result.json',{'databaseRecovery':'PASS','archiveSha256':manifest['files']['database.dump'],'projectRef':manifest['identity']['projectRef'],'externalServices':'NOT_VERIFIED','authHttpE2E':'NOT_RUN'})
        print('Isolated database restore and complete inventory comparison passed. External Supabase services remain unverified.')
    finally:
        if started:
            r.run('pg_ctl','-D',pgdata,'-m','immediate','-w','stop')
        pf.unlink(missing_ok=True)
        # Keep stopped PGDATA and all diagnostics inside the vault for owner inspection; never remove existing data.

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode',choices=['export','restore']); parser.add_argument('--pg-bin',required=True)
    parser.add_argument('--workspace',required=True); parser.add_argument('--profile'); parser.add_argument('--backup')
    for flag in ('vault-confirmed','writers-quiesced','authorize-local-restore','network-disconnected','host-memory-protected','roles-reviewed'):
        parser.add_argument('--'+flag,action='store_true')
    args=parser.parse_args()
    try: (export if args.mode=='export' else restore)(args)
    except Exception:
        print('BLOCKED: no recovery success certified. Inspect the private vault diagnostics; never paste credentials or dump contents.',file=sys.stderr)
        return 1
    return 0
if __name__=='__main__': sys.exit(main())
