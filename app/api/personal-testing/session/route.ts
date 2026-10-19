import { cookies } from 'next/headers'
import { localRuntime, trustedLocalHost, validUnlock, localSession, personalCookie, privateHeaders, personalReady } from '../../../../src/lib/billing/personal-security'
import { readBoundedJsonBody } from '../../../billing/bounded-json-body'

export const runtime='nodejs'
let failures=0; let windowStart=0
export async function POST(request: Request) {
  const fail=(status:number)=>Response.json({error:'Local unlock unavailable or rejected'},{status,headers:privateHeaders})
  if(!personalReady() || !localRuntime()) return fail(404)
  if(!trustedLocalHost(request.headers.get('host')) || request.headers.get('origin')!==new URL(request.url).origin) return fail(403)
  if(Date.now()-windowStart>60_000){failures=0;windowStart=Date.now()}
  if(failures>=10) return fail(429)
  const body=await readBoundedJsonBody(request,2048)
  if(!body.ok) return fail(400)
  try{
    const value=JSON.parse(body.text)
    if(Object.keys(value).join(',')!=='code' || typeof value.code!=='string' || !validUnlock(value.code)){failures++;return fail(403)}
    // Root-scoped local-only cookie covers the page and API, with no record/key data.
    ;(await cookies()).set(personalCookie,localSession(),{httpOnly:true,sameSite:'strict',secure:false,path:'/',maxAge:8*60*60})
    return Response.json({ok:true},{headers:privateHeaders})
  }catch{failures++;return fail(403)}
}
