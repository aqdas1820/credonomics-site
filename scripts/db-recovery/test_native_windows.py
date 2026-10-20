"""Fresh local native PG17 synthetic roundtrip only. No mounted vault or hosted data.
Set CN_NATIVE_PG17_BIN explicitly in CI; default unittest never starts a server.
"""
import json
import os
from pathlib import Path
import secrets
import socket
import tempfile
import unittest
import hosted_backup as h

@unittest.skipUnless(os.name=='nt' and os.environ.get('CN_NATIVE_PG17_BIN'),'Windows PG17 synthetic opt-in only')
class NativeWindowsRecovery(unittest.TestCase):
    def test_full_native_archive_preserves_rows_roles_rls_and_sequence(self):
        with tempfile.TemporaryDirectory(prefix='cn-synthetic-only-') as temp:
            root=Path(temp); runners=[]
            def start(label,user):
                work=root/label;work.mkdir();h.restrict_acl(work,True);pf=work/'pass';pw=work/'pw';pw.write_text(secrets.token_hex(32));h.restrict_acl(pw)
                with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
                h.passfile(pf,'127.0.0.1',port,user,pw.read_text())
                r=h.Runner(os.environ['CN_NATIVE_PG17_BIN'],work,h.environment('127.0.0.1',port,user,pf))
                self.assertIn(b'17.',r.run('pg_restore','--version'))
                r.run('initdb','-D',work/'pgdata','-U',user,'--pwfile',pw,'--auth-host=scram-sha-256','--auth-local=scram-sha-256','--encoding=UTF8','--no-locale')
                r.run('pg_ctl','-D',work/'pgdata','-l',work/'server.log','-o',f'-h 127.0.0.1 -p {port}','-w','start');runners.append(r)
                return r
            try:
                source=start('source','postgres')
                source.sql("CREATE TABLE public.synthetic_invoice(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,amount int CHECK(amount>0)); INSERT INTO public.synthetic_invoice(amount) VALUES(123); ALTER TABLE public.synthetic_invoice ENABLE ROW LEVEL SECURITY; CREATE POLICY deny_all ON public.synthetic_invoice USING(false);")
                source.sql('CREATE ROLE synthetic_reader NOLOGIN; CREATE ROLE synthetic_operator NOLOGIN; GRANT synthetic_reader TO synthetic_operator WITH ADMIN TRUE, INHERIT FALSE, SET TRUE;')
                expected=h.inventory(source)
                source.run('pg_dumpall','--roles-only','--no-role-passwords','--file',root/'roles.sql')
                source.run('pg_dump','--format=custom','--file',root/'database.dump')
                source.run('pg_restore','--list',root/'database.dump')
                target=start('target','cn_restore_'+secrets.token_hex(8))
                target.run('psql','-X','-v','ON_ERROR_STOP=1','-f',root/'roles.sql')
                h.restore_memberships(target,expected['memberships'])
                target.sql('CREATE DATABASE recovered TEMPLATE template0');target.env['PGDATABASE']='recovered'
                target.run('pg_restore','--single-transaction','--exit-on-error','--dbname=recovered',root/'database.dump')
                target.sql('ALTER DATABASE recovered OWNER TO postgres')
                self.assertEqual(expected,h.inventory(target))
                self.assertEqual(target.sql('SELECT amount FROM public.synthetic_invoice').strip(),b'123')
            except Exception:
                # This harness has only fresh public synthetic fixtures, never owner data.
                for log in sorted(root.rglob('*.stderr'))+sorted(root.rglob('server.log')):
                    print('SYNTHETIC ONLY '+log.name+': '+log.read_text(errors='replace')[-5000:])
                raise
            finally:
                for r in reversed(runners):r.run('pg_ctl','-D',r.workspace/'pgdata','-m','immediate','-w','stop')
if __name__=='__main__':unittest.main()
