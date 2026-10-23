import { describe, expect, test } from 'vitest'
import fs from 'node:fs'

function luminance(hex: string) {
  const channels = hex.replace('#', '').match(/../g)!.map(v => parseInt(v, 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722
}
const css = fs.readFileSync('app/midnight.css', 'utf8')
const blocks = [...css.matchAll(/:root(?:\[data-theme='light'\])?\s*\{([^}]+)\}/g)]
for (const [index, match] of blocks.entries()) {
  const palette = Object.fromEntries([...match[1].matchAll(/--cn-([\w-]+):\s*(#[\da-f]{6})\b/gi)].map(x => [x[1], x[2]]))
  describe(`${index ? 'light' : 'dark'} text contrast`, () => {
    for (const foreground of ['text', 'muted', 'cyan', 'blue', 'success', 'warning', 'danger']) {
      for (const background of ['bg', 'surface', 'surface-raised']) {
        test(`${foreground} on ${background} meets normal-text AA`, () => {
          const [a, b] = [luminance(palette[foreground]), luminance(palette[background])].sort((x, y) => y - x)
          expect((a + .05) / (b + .05)).toBeGreaterThanOrEqual(4.5)
        })
      }
    }
    test('primary button label has AA contrast', () => {
      const [a, b] = [luminance(palette.cyan), luminance(palette['on-accent'])].sort((x, y) => y - x)
      expect((a + .05) / (b + .05)).toBeGreaterThanOrEqual(4.5)
    })
  })
}
