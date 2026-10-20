import fs from 'node:fs';
import path from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
const root=path.resolve(import.meta.dirname,'../..');
const out=process.argv[2]; if(!out)throw Error('OUTPUT_REQUIRED');fs.mkdirSync(out,{recursive:true});
for(const [source,name] of [['src/lib/billing/youpi-contract.ts','invoice-domain.mjs'],['src/lib/billing/youpi-payment-link.ts','payment-link.mjs'],['app/billing/uuid-policy.ts','uuid-policy.mjs']]){
 let text=stripTypeScriptTypes(fs.readFileSync(path.join(root,source),'utf8'),{mode:'strip'});
 text=text.replace('../../../app/billing/uuid-policy','./uuid-policy.mjs');
 fs.writeFileSync(path.join(out,name),text);
}
fs.copyFileSync(path.join(import.meta.dirname,'server.mjs'),path.join(out,'server.mjs'));
