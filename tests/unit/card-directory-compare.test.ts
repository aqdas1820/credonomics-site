import { describe, expect, it } from 'vitest'
import { buildDirectoryCompareLink } from '../../app/data/card-directory-compare'

const card = (id: string, ...slugs: Array<'cashback' | 'shopping' | 'fuel' | 'travel'>) => ({
  id,
  categories: slugs.map(slug => ({ slug })),
})

describe('card directory compare links', () => {
  it('requires between two and three distinct cards', () => {
    expect(buildDirectoryCompareLink([card('a', 'cashback')])).toBeNull()
    expect(buildDirectoryCompareLink([card('a', 'cashback'), card('a', 'cashback')])).toBeNull()
    expect(buildDirectoryCompareLink([
      card('a', 'cashback'), card('b', 'cashback'), card('c', 'cashback'), card('d', 'cashback'),
    ])).toBeNull()
  })
  it('only compares cards with a common normalized category', () => {
    expect(buildDirectoryCompareLink([card('a', 'fuel'), card('b', 'travel')])).toBeNull()
    const link = buildDirectoryCompareLink([card('a', 'shopping', 'cashback'), card('b', 'cashback', 'shopping')])
    expect(link).toBeTruthy()
    const params = new URL(link!, 'https://example.com').searchParams
    expect(params.get('category')).toBe('shopping')
    expect(params.get('cards')).toBe('a,b')
  })
  it('honours a shared selected category rather than the first automatic match', () => {
    const link = buildDirectoryCompareLink([
      card('a', 'cashback', 'shopping'), card('b', 'shopping', 'cashback'),
    ], 'shopping')
    expect(new URL(link!, 'https://example.com').searchParams.get('category')).toBe('shopping')
  })
})
