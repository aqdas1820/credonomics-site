import { it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import SupportCredonomics from '../../app/components/SupportCredonomics'

const hooks = vi.hoisted(() => ({ index: 0, amount: 100, available: true }))
vi.mock('react', async original => {
  const actual = await original<typeof import('react')>()
  return { ...actual, useEffect: () => {}, useCallback: (fn: unknown) => fn,
    useRef: (initial: unknown) => ({ current: initial }),
    useState: (initial: unknown) => [hooks.index++ === 0 ? hooks.available : hooks.index === 2 ? hooks.amount : initial, vi.fn()] }
})
afterEach(() => vi.unstubAllGlobals())

function anchor(node: any): any {
  if (!node || typeof node !== 'object') return undefined
  if (node.type === 'a') return node
  const children = Array.isArray(node.props?.children) ? node.props.children : [node.props?.children]
  return children.map(anchor).find(Boolean)
}
for (const amount of [10, 100, 500]) it(`actual popup contribution handler sends selected ${amount} and navigates to returned checkout`, async () => {
  hooks.index = 0; hooks.amount = amount; hooks.available = true
  vi.stubGlobal('React', React)
  const assign = vi.fn(); const storage = vi.fn()
  vi.stubGlobal('window', { crypto: { randomUUID: () => '11111111-1111-4111-8111-111111111111' },
    location: { assign }, localStorage: { setItem: storage } })
  const url = `https://pay.credonomics.in/checkout/${String(amount).padStart(8, '0')}-1111-4111-8111-111111111111`
  const request = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => Response.json({ checkoutUrl: url }, { status: 201 }))
  vi.stubGlobal('fetch', request)
  const button = anchor(SupportCredonomics())
  const preventDefault = vi.fn()
  await button.props.onClick({ preventDefault })
  expect(preventDefault).toHaveBeenCalledOnce()
  expect(request).toHaveBeenCalledOnce()
  expect(JSON.parse(request.mock.calls[0][1]!.body as string)).toEqual({ amount })
  expect(assign).toHaveBeenCalledWith(url)
  expect(storage).toHaveBeenCalledWith('credonomics-support-dismissed-until', expect.any(String))
})
it('collection-disabled button preserves native mailto and existing dismissal without creating a session', async () => {
  hooks.index = 0; hooks.available = false; hooks.amount = 100
  vi.stubGlobal('React', React)
  const request = vi.fn(); const storage = vi.fn()
  vi.stubGlobal('fetch', request)
  vi.stubGlobal('window', { localStorage: { setItem: storage } })
  const button = anchor(SupportCredonomics()); const preventDefault = vi.fn()
  await button.props.onClick({ preventDefault })
  expect(button.props.href).toMatch(/^mailto:hello@credonomics.in\?/)
  expect(request).not.toHaveBeenCalled(); expect(preventDefault).not.toHaveBeenCalled()
  expect(storage).toHaveBeenCalledOnce()
})
