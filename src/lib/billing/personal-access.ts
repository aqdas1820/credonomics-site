import 'server-only'
import { cookies, headers } from 'next/headers'
import { authenticatedUser } from '../supabase/server'
import { localRuntime, trustedLocalHost, validLocalSession, personalCookie, localOwner, ownerIdentity, personalReady } from './personal-security'

export async function personalActor(): Promise<string | null> {
  if (!personalReady()) return null
  try {
    if (localRuntime()) {
      if (!trustedLocalHost((await headers()).get('host'))) return null
      return validLocalSession((await cookies()).get(personalCookie)?.value) ? localOwner : null
    }
    const { user } = await authenticatedUser()
    return ownerIdentity(user) ? user!.id.toLowerCase() : null
  } catch { return null }
}
