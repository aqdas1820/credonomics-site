import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { guardedSupabaseFetch } from './mutation-safety'
export function createSupabaseAdminClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;return url&&key?createClient(url,key,{global:{fetch:guardedSupabaseFetch},auth:{persistSession:false,autoRefreshToken:false}}):null}
