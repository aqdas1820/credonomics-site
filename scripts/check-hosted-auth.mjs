// Read-only preflight; public key only. Does not sign in, create users or set roles.
import {isMainThread} from 'node:worker_threads';
const ref=process.env.BILLING_EXPECTED_SUPABASE_PROJECT_REF;
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const origin=process.env.AUTH_PREFLIGHT_APP_ORIGIN;
try {
  if(!isMainThread || !/^[a-z0-9]{20}$/.test(ref??'') || url!==`https://${ref}.supabase.co` || !key || !origin) throw Error();
  const site=new URL(origin);
  if(site.origin!==origin || site.protocol!=='https:' || site.username || site.password) throw Error();
  const settings=await fetch(url+'/auth/v1/settings',{headers:{apikey:key},redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!settings.ok)throw Error();
  const auth=await settings.json();
  const session=await fetch(origin+'/api/account/session',{redirect:'error',signal:AbortSignal.timeout(15000)});
  if(!session.ok)throw Error();
  const state=await session.json();
  console.log(JSON.stringify({projectRef:ref,appOrigin:origin,googleProviderEnabled:auth.external?.google===true,
    anonymousProviderEnabled:auth.external?.anonymous_users===true,appConfigured:state.data?.configured===true,
    oauthRedirectUri:url+'/auth/v1/callback',appCallback:origin+'/auth/callback',
    callbackAllowlist:'OWNER_DASHBOARD_REVIEW_REQUIRED',actualLogin:'NOT_RUN',billingAdministrator:'NOT_VERIFIED'},null,2));
} catch { console.error('Hosted Auth preflight BLOCKED; no user or credential data logged.');process.exitCode=1; }
