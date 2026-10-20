import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import hosted_backup as h

class RecoveryGuards(unittest.TestCase):
    def profile(self):
        return dict(projectRef='jvpiulmcjjnsgozgqgzw',environment='staging',host='db.jvpiulmcjjnsgozgqgzw.supabase.co',port=5432,database='postgres',user='postgres')
    def test_exact_target_and_no_staging_relabel(self):
        p=self.profile(); self.assertEqual(h.validate_profile(p),p)
        for key,value in [('host','evil.example'),('port',6543),('environment','production'),('user','anon'),('projectRef','')]:
            p=self.profile();p[key]=value
            with self.assertRaises(ValueError): h.validate_profile(p)
    def test_role_replay_preserves_grantor_options_and_quotes_identifiers(self):
        from unittest.mock import Mock
        r=Mock();h.restore_memberships(r,[['pg_read_all_stats','pg_monitor','postgres',False,True,True],['role"name','member','grantor',True,False,True]])
        self.assertIn('ADMIN FALSE, INHERIT TRUE, SET TRUE GRANTED BY "postgres"',r.sql.call_args_list[0].args[0])
        self.assertIn('"role""name"',r.sql.call_args_list[1].args[0])
        with self.assertRaises(ValueError):h.restore_memberships(r,[['a','b','c','true',True,True]])
    def test_pg17_role_bootstrap_reuses_source_grantor_without_stripping_grants(self):
        roles=[['postgres',True,True,True,True,True]]
        source=('CREATE ROLE postgres;\nALTER ROLE postgres WITH SUPERUSER LOGIN;\n'
                'CREATE ROLE synthetic_reader;\n'
                'GRANT synthetic_reader TO synthetic_operator WITH ADMIN OPTION, INHERIT FALSE GRANTED BY postgres;\n')
        replay=h.bootstrap_role_replay_sql(source,roles)
        self.assertNotIn('CREATE ROLE postgres;',replay)
        self.assertIn('ALTER ROLE postgres WITH SUPERUSER LOGIN;',replay)
        self.assertIn('CREATE ROLE synthetic_reader;',replay)
        self.assertIn('GRANTED BY postgres;',replay)
        for invalid in ([],[['postgres',False,True,True,True,True]],
                        [['postgres',True,True,True,True,False]]):
            with self.assertRaises(ValueError):h.bootstrap_role_replay_sql(source,invalid)
        for invalid_sql in ('CREATE ROLE someone_else;\n',
                            'CREATE ROLE postgres;\nCREATE ROLE postgres;\n'):
            with self.assertRaises(ValueError):h.bootstrap_role_replay_sql(invalid_sql,roles)
    def test_profile_rejects_password_fields(self):
        p=self.profile();p['password']='SYNTHETIC ONLY'
        with self.assertRaises(ValueError):h.validate_profile(p)
    def test_session_pooler_requires_project_bound_username_and_session_port(self):
        p=self.profile();p.update(host='aws-1-ap-south-1.pooler.supabase.com',user='postgres.'+p['projectRef'])
        self.assertEqual(h.validate_profile(p),p)
        for key,value in [('port',6543),('user','postgres'),('host','evil.pooler.supabase.com')]:
            q=dict(p);q[key]=value
            with self.assertRaises(ValueError):h.validate_profile(q)
    def test_environment_cannot_inherit_password_or_service(self):
        with patch.dict(os.environ,{'PGPASSWORD':'synthetic','PGSERVICE':'other','PGOPTIONS':'-c unsafe=on'}):
            e=h.environment('db.example',5432,'postgres',Path('R:/private/pass'),True)
        self.assertNotIn('PGPASSWORD',e);self.assertNotIn('PGSERVICE',e)
        self.assertEqual(e['PGSSLMODE'],'verify-full');self.assertIn('read_only=on',e['PGOPTIONS'])
        self.assertEqual(e['PGSSLROOTCERT'],'system')
    def test_non_windows_refuses_before_any_connection(self):
        with patch.object(h.os,'name','posix'):
            with self.assertRaises(ValueError): h.vault_path('/tmp/plaintext')
    def test_write_once_evidence_and_archive_corruption(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'manifest.json';h.save(p,{'recovery':'NOT_TESTED'})
            with self.assertRaises(FileExistsError): h.save(p,{})
            before=h.digest(p);p.write_text('corrupt');self.assertNotEqual(before,h.digest(p))
    def test_restore_requires_explicit_attestations_before_native_commands(self):
        from types import SimpleNamespace
        with patch.object(h,'vault_path',return_value=Path('R:/private')),patch.object(h,'Runner') as runner:
            with self.assertRaises(ValueError):
                h.restore(SimpleNamespace(backup='x',workspace='y',authorize_local_restore=False,network_disconnected=False,host_memory_protected=False,vault_confirmed=False,roles_reviewed=False))
            runner.assert_not_called()
if __name__=='__main__':unittest.main()
