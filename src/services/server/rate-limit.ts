const buckets=new Map<string,{count:number;reset:number}>()
export function rateLimit(key:string,limit:number,windowMs=60_000){const now=Date.now(),old=buckets.get(key);const bucket=!old||old.reset<=now?{count:0,reset:now+windowMs}:old;bucket.count+=1;buckets.set(key,bucket);return bucket.count<=limit}
