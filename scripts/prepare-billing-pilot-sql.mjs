// Prepare review material only. No database connection, credentials or hosted writes.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
export const pilotFiles=['docs/billing/012_billing_private_review.sql','docs/billing/013_invoice_create_rpc_REVIEW_ONLY.sql',
  'docs/billing/014_slice_settlement_rpc_REVIEW_ONLY.sql','docs/billing/015_admin_invoice_read_rpc_REVIEW_ONLY.sql',
  'docs/billing/016_youpi_observation_rpc_REVIEW_ONLY.sql','docs/billing/PHASE28_LINK_LEDGER_REVIEW_ONLY.sql',
  'docs/billing/017_youpi_utr_claims_REVIEW_ONLY.sql','supabase/migrations/20261020144859_manual_upi_pilot.sql'];
export async function preparePilotSql(){
  const files=[],parts=[];
  for(const file of pilotFiles){
    const raw=await fs.readFile(path.join(root,file),'utf8');
    if((raw.match(/^begin;\s*$/gim)||[]).length!==1 || !/commit;\s*$/i.test(raw))throw Error('Unexpected transaction boundaries: '+file);
    files.push({file,sha256:createHash('sha256').update(raw).digest('hex')});
    parts.push('-- '+file+'\n'+raw.replace(/^begin;\s*$/im,'').replace(/commit;\s*$/i,''));
  }
  const sql="-- REVIEW ONLY; owner must confirm target, restored backup and explicit approval.\n-- Never use for an existing billing deployment. All eight scripts run atomically.\nbegin;\ndo $$ begin if to_regnamespace('billing_private') is not null then raise exception 'Existing billing schema: incremental review required'; end if; end $$;\n"+parts.join('\n')+'\ncommit;\n';
  return {files,sql,sha256:createHash('sha256').update(sql).digest('hex')};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const result=await preparePilotSql();
  if(process.argv.length===4 && process.argv[2]==='--write') await fs.writeFile(process.argv[3],result.sql,{flag:'wx',mode:0o600});
  else if(process.argv.length!==2)throw Error('Usage: node scripts/prepare-billing-pilot-sql.mjs [--write NEW_REVIEW_FILE]');
  console.log(JSON.stringify({expectedStagingProject:'jvpiulmcjjnsgozgqgzw',hostedApproval:false,sha256:result.sha256,files:result.files},null,2));
}
