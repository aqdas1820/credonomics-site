import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const roots = ['app', 'src']
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.md', '.css'])
const malformed = ['\u00c3\u00a2', '\u00c3\u0082', '\u00c3\u0192', '\u00ef\u00bf\u00bd']

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return sourceFiles(target)
    return extensions.has(path.extname(entry.name)) ? [target] : []
  })
}

describe('production text encoding', () => {
  it('contains no common mojibake sequences', () => {
    const offenders = roots.flatMap(sourceFiles).filter((file) => {
      if (file.endsWith('content-encoding.test.ts')) return false
      if (file.endsWith('.generated.ts')) return false
      const content = fs.readFileSync(file, 'utf8')
      return malformed.some((sequence) => content.includes(sequence))
    })
    expect(offenders).toEqual([])
  })
})
