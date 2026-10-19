import { describe, it, expect } from 'vitest'
import { isBillingDatabaseScopeConfirmed } from './db-scope'
const expected = 'abcdefghijklmnopqrst'
const url = 'https://abcdefghijklmnopqrst.supabase.co'
describe('CredoNomics database project scope gate', () => {
  it('requires an explicitly owner-confirmed project ref', () =>
    expect(isBillingDatabaseScopeConfirmed(undefined, url)).toBe(false))
  it('accepts only a matching HTTPS Supabase API host', () =>
    expect(isBillingDatabaseScopeConfirmed(expected, url)).toBe(true))
  it('rejects a different project even with valid Supabase hostname', () =>
    expect(isBillingDatabaseScopeConfirmed(expected, 'https://differentprojectref.supabase.co')).toBe(false))
  it('rejects non-https and lookalike domains', () => {
    expect(isBillingDatabaseScopeConfirmed(expected, 'http://abcdefghijklmnopqrst.supabase.co')).toBe(false)
    expect(isBillingDatabaseScopeConfirmed(expected, url + '.attacker.com')).toBe(false)
  })
  it('rejects credentials, ports, query and fragment', () => {
    for (const invalid of [
      'https://user:secret@abcdefghijklmnopqrst.supabase.co',
      'https://abcdefghijklmnopqrst.supabase.co:8443',
      url + '?q=1', url + '#x',
    ]) expect(isBillingDatabaseScopeConfirmed(expected, invalid)).toBe(false)
  })
  it('rejects blank, unknown and invalid project refs', () => {
    for(const invalid of ['', 'example', 'CardLedger', 'ABCDEF01234567890123']) {
      expect(isBillingDatabaseScopeConfirmed(invalid, url)).toBe(false)
    }
  })
})
