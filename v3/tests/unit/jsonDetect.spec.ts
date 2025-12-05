import { describe, it, expect } from 'vitest'
import { isJsonStart, detectValidJsonStart } from '../../src/utils/jsonDetect'

describe('jsonDetect', () => {
  it('detects start with {', () => {
    expect(isJsonStart(' {"a":1}')).toBe(true)
    expect(isJsonStart('\n  {"a":1}')).toBe(true)
    expect(isJsonStart('x{"a":1}')).toBe(false)
  })

  it('parses valid JSON quickly', () => {
    const input = '   {"a":1,"b":[1,2,3],"c":{"d":4}}'
    const t0 = Date.now()
    const j = detectValidJsonStart(input)
    const dt = Date.now() - t0
    expect(j && j.a).toBe(1)
    expect(dt).toBeLessThan(50)
  })

  it('returns null for invalid JSON', () => {
    const input = ' { a:1 }'
    const j = detectValidJsonStart(input)
    expect(j).toBeNull()
  })

  it('returns null when not starting with {', () => {
    const input = 'hello {"a":1}'
    const j = detectValidJsonStart(input)
    expect(j).toBeNull()
  })

  it('handles milestones JSON', () => {
    const input = '  {"milestones":[]}'
    const j = detectValidJsonStart(input)
    expect(Array.isArray(j && j.milestones)).toBe(true)
  })
})
