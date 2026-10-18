import { describe, expect, it } from 'vitest'
import { sameOrigin } from './request-policy'
describe('billing request origin', () => {
  it('allows exact HTTPS origin', () => expect(sameOrigin('https://www.credonomics.in', 'https://www.credonomics.in')).toBe(true))
  it('denies missing origin', () => expect(sameOrigin(null, 'https://www.credonomics.in')).toBe(false))
  it('denies phishing subdomain', () => expect(sameOrigin('https://www.credonomics.in.attacker.example', 'https://www.credonomics.in')).toBe(false))
  it('denies HTTP downgrade', () => expect(sameOrigin('http://www.credonomics.in', 'http://www.credonomics.in')).toBe(false))
  it('allows localhost dev', () => expect(sameOrigin('http://localhost:3000', 'http://localhost:3000')).toBe(true))
  it.each(['https://user@www.credonomics.in', 'https://www.credonomics.in/path', 'https://www.credonomics.in?x=1',
    'https://www.credonomics.in#fragment', 'ftp://localhost:3000'])('denies malformed/non-web origin %s', origin =>
    expect(sameOrigin(origin, origin.startsWith('ftp') ? origin : 'https://www.credonomics.in')).toBe(false))
})
