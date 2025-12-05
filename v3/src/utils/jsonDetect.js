export function isJsonStart(text) {
  const s = (text || '')
  const t = s.trimStart()
  return t.startsWith('{')
}

export function detectValidJsonStart(text) {
  const s = (text || '')
  const t = s.trimStart()
  if (!t.startsWith('{')) return null
  try {
    const j = JSON.parse(t)
    return j
  } catch {
    return null
  }
}
