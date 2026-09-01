import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

export const CORE_SCHEMES = [
  ['HDFC Flexi Cap Fund', 'Flexi Cap', ['HDFC Flexi Cap Fund', 'HDFC Equity Fund']],
  ['HDFC Mid Cap Fund', 'Mid Cap', ['HDFC Mid Cap Fund', 'HDFC Mid Cap Opportunities Fund', 'HDFC Mid-Cap Opportunities Fund']],
  ['HDFC Small Cap Fund', 'Small Cap', ['HDFC Small Cap Fund']],
  ['HDFC Large and Mid Cap Fund', 'Large & Mid Cap', ['HDFC Large and Mid Cap Fund', 'HDFC Growth Opportunities Fund']],
  ['HDFC Multi Cap Fund', 'Multi Cap', ['HDFC Multi Cap Fund']],
  ['HDFC Focused Fund', 'Focused', ['HDFC Focused Fund', 'HDFC Focused 30 Fund']],
]
export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
export const ISIN_RE = /^IN[A-Z0-9]{10}$/
const CONTAMINATION = [/\b(?:expense ratio|management fees?|service tax|additional expenses?|benchmark|riskometer|fund manager|exit load|nav as on|portfolio total|grand total|sub.?total|category of scheme|top holdings|footnotes?)\b/i,/\b(?:regular|direct)\s*:\s*\d+(?:\.\d+)?%/i,/^\s*(?:total|portfolio|equity|industry|company|security|scheme|date)\s*$/i,/\b(?:as on|factsheet)\s+\d/i]
export function parseCsv(input) { const rows=[];let row=[],field='',quoted=false;for(let i=0;i<input.length;i++){const c=input[i];if(quoted){if(c==='"'&&input[i+1]==='"'){field+='"';i++}else if(c==='"')quoted=false;else field+=c}else if(c==='"')quoted=true;else if(c===','){row.push(field);field=''}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field=''}else field+=c}if(field||row.length){row.push(field);rows.push(row)}const headers=rows.shift()??[];return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])))}
export function normalizeIsin(value){const raw=String(value??'').trim().toUpperCase().replace(/\s+/g,'');if(!raw)return{status:'MISSING',value:null};return ISIN_RE.test(raw)?{status:'VALID',value:raw}:{status:'INVALID',value:null,raw}}
export function classifySecurityName(value){const raw=String(value??'').replace(/[\r\n\u00a0]+/g,' ').replace(/\s+/g,' ').trim();if(!raw||/^[\d.,%()\s-]+$/.test(raw)||CONTAMINATION.some(re=>re.test(raw)))return{status:'REJECTED',value:raw,reason:'contaminated_or_non_security_text'};if(raw.length>140||raw.split(' ').length>18||/[£�]/.test(raw))return{status:'REQUIRES_REVIEW',value:raw,reason:'malformed_or_ambiguous_text'};const cleaned=raw.replace(/^(?:â€¢|•|\*)\s*/,'').replace(/\s+IT\s*-\s*$/i,'').trim();if(!cleaned||cleaned.length<3)return{status:'REJECTED',value:raw,reason:'empty_after_normalization'};return{status:cleaned===raw?'VALID':'NORMALIZED',value:cleaned}}
export function parsePercentage(value){const raw=String(value??'').trim().replace(/%$/,'');if(!raw)return{ok:false,reason:'missing_percentage'};const number=Number(raw);if(!Number.isFinite(number))return{ok:false,reason:'malformed_percentage'};if(number<0)return{ok:false,reason:'negative_percentage'};if(number>100)return{ok:false,reason:'percentage_over_100'};return{ok:true,value:number}}
export const slugify=value=>String(value).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
export const securityKey=name=>`NAME:${slugify(name)}`
export const stableHash=value=>crypto.createHash('sha256').update(value).digest('hex')
export function monthsBetween(first,last){const out=[];let[y,m]=first.split('-').map(Number);const[ey,em]=last.split('-').map(Number);while(y<ey||(y===ey&&m<=em)){out.push(`${y}-${String(m).padStart(2,'0')}`);m++;if(m===13){y++;m=1}}return out}
export function qualityFor({errors,warnings,missingCombinations,latestMonth,now=new Date()}){if(errors>0)return'INVALID';const age=(now.getUTCFullYear()*12+now.getUTCMonth())-(Number(latestMonth.slice(0,4))*12+Number(latestMonth.slice(5,7))-1);if(missingCombinations>0)return'PARTIAL';if(age>2)return'STALE';if(warnings>0)return'VALIDATED_WITH_WARNINGS';return'VERIFIED'}
export function deterministicSort(a,b){return a.scheme.localeCompare(b.scheme)||a.month.localeCompare(b.month)||b.weight-a.weight||a.stock.localeCompare(b.stock)}
export function writeJson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,`${JSON.stringify(value,null,2)}\n`,'utf8')}
