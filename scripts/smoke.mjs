const BASE = 'http://localhost:5173'

async function waitForServer(timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs
  let lastErr = null
  while (Date.now() < deadline) {
    try {
      const r = await fetch(BASE)
      if (r.ok) return true
    } catch (e) { lastErr = e }
    await new Promise(r => setTimeout(r, 500))
  }
  throw new Error('Dev server not reachable: ' + (lastErr && lastErr.message || lastErr))
}

async function check(path, expectText) {
  const r = await fetch(BASE + path)
  if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + path)
  const html = await r.text()
  if (!html.includes(expectText)) throw new Error('Missing text ' + JSON.stringify(expectText) + ' in ' + path)
}

;(async () => {
  await waitForServer()
  await check('/', 'Milestone v3')
  await check('/chat?goal=AutoTest', '对话')
  await check('/selftest', '自检')
  console.log('SMOKE OK')
  process.exit(0)
})().catch(err => { console.error('SMOKE FAIL', err); process.exit(1) })
