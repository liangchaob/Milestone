export function isJsonStart(text) {
  const s = (text || '')
  const t = s.trimStart()
  return t.startsWith('{')
}

export function detectValidJsonStart(text) {
  const s = (text || '')
  const t = s.trimStart()
  if (!t.startsWith('{')) return null
  let depth = 0
  let inStr = false
  let esc = false
  for (let i = 0; i < t.length; i++) {
    const ch = t[i]
    if (inStr) {
      if (esc) { esc = false; continue }
      if (ch === '\\') { esc = true; continue }
      if (ch === '"') { inStr = false; continue }
      continue
    } else {
      if (ch === '"') { inStr = true; continue }
      if (ch === '{') { depth++ }
      else if (ch === '}') {
        depth--
        if (depth === 0) {
          const candidate = t.slice(0, i + 1)
          try { return JSON.parse(candidate) } catch {}
          break
        }
      }
    }
  }
  try {
    const j = JSON.parse(t)
    return j
  } catch {
    return null
  }
}

export function findMilestonesJson(text) {
  const s = (text || '')
  const t = s.trimStart()
  let inStr = false
  let esc = false
  for (let start = 0; start < t.length; start++) {
    if (inStr) {
      if (esc) { esc = false; continue }
      if (t[start] === '\\') { esc = true; continue }
      if (t[start] === '"') { inStr = false; continue }
      continue
    } else {
      if (t[start] === '"') { inStr = true; esc = false; continue }
      if (t[start] !== '{') continue
      let depth = 0
      let i = start
      let str = false
      let e = false
      for (; i < t.length; i++) {
        const ch = t[i]
        if (str) {
          if (e) { e = false; continue }
          if (ch === '\\') { e = true; continue }
          if (ch === '"') { str = false; continue }
          continue
        } else {
          if (ch === '"') { str = true; e = false; continue }
          if (ch === '{') depth++
          else if (ch === '}') {
            depth--
            if (depth === 0) {
              const candidate = t.slice(start, i + 1)
              try {
                const obj = JSON.parse(candidate)
                if (obj && Array.isArray(obj.milestones)) return obj
              } catch {}
              break
            }
          }
        }
      }
    }
  }
  return null
}

export function repairMilestonesJson(text) {
  let s = String(text || '')
  const m = s.match(/```[a-zA-Z]*\n?([\s\S]*?)```/)
  if (m && m[1]) s = m[1]
  s = s.replace(/\/\*[\s\S]*?\*\//g, '')
  s = s.replace(/(^|\n)\s*\/\/.*(?=\n|$)/g, '')
  s = s.replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":')
  s = s.replace(/:\s*(True|False|None)\b/g, (x, p1) => {
    const v = String(p1).toLowerCase()
    return ': ' + (v === 'none' ? 'null' : v)
  })
  s = s.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"')
  s = s.replace(/,(\s*[}\]])/g, '$1')
  let t = s.trimStart()
  if (!t.startsWith('{')) {
    const i = t.indexOf('{')
    if (i >= 0) t = t.slice(i)
  }
  let depth = 0
  let inStr = false
  let esc = false
  let end = -1
  for (let i = 0; i < t.length; i++) {
    const ch = t[i]
    if (inStr) {
      if (esc) { esc = false; continue }
      if (ch === '\\') { esc = true; continue }
      if (ch === '"') { inStr = false; continue }
      continue
    } else {
      if (ch === '"') { inStr = true; continue }
      if (ch === '{') depth++
      else if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break } }
    }
  }
  const candidate = end > 0 ? t.slice(0, end) : t
  try {
    const obj = JSON.parse(candidate)
    if (obj && Array.isArray(obj.milestones)) return obj
    const deep = extractMilestonesObject(obj)
    if (deep) return deep
  } catch {}
  return null
}

export function extractMilestonesObject(obj) {
  try {
    if (!obj || typeof obj !== 'object') return null
    if (Array.isArray(obj.milestones)) return obj
    const seen = new Set()
    function walk(x) {
      if (!x || typeof x !== 'object') return null
      if (seen.has(x)) return null
      seen.add(x)
      if (Array.isArray(x.milestones)) return x
      for (const k of Object.keys(x)) {
        const v = x[k]
        const r = walk(v)
        if (r) return r
      }
      return null
    }
    return walk(obj)
  } catch {
    return null
  }
}
