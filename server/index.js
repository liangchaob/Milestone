import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { SYSTEM_PROMPT } from './systemPrompt.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

let config = { baseUrl: 'https://api.moonshot.cn/v1', apiKey: '', model: '' }
function trunc(s, n = 400) { const t = String(s || ''); return t.length > n ? (t.slice(0, n) + '…') : t }
function readConfig() {
  const candidates = [
    path.join(process.cwd(), 'server', 'apikey.json'),
    path.join(process.cwd(), 'apikey.json'),
    path.join(process.cwd(), 'v3', 'apikey.json')
  ]
  for (const p of candidates) {
    try {
      if (!fs.existsSync(p)) continue
      const j = JSON.parse(fs.readFileSync(p, 'utf-8') || '{}')
      config.apiKey = (j.api_key || j.key || '').trim()
      config.model = (j.model || '').trim()
      config.baseUrl = (j.base_url || config.baseUrl).trim()
      break
    } catch {}
  }
  if (process.env.KIMI_API_KEY) config.apiKey = process.env.KIMI_API_KEY.trim()
  if (process.env.KIMI_MODEL) config.model = process.env.KIMI_MODEL.trim()
  if (process.env.KIMI_BASE_URL) config.baseUrl = process.env.KIMI_BASE_URL.trim()
}
readConfig()

app.get('/api/health', (req, res) => { res.json({ ok: true }) })
app.get('/api/config', (req, res) => { res.json({ baseUrl: !!config.baseUrl, model: !!config.model, apiKey: !!config.apiKey }) })
app.get('/api/config/detail', (req, res) => { res.json({ baseUrl: config.baseUrl, model: config.model, apiKey: !!config.apiKey }) })
app.post('/api/config/reload', (req, res) => { readConfig(); res.json({ ok: true, baseUrl: !!config.baseUrl, model: !!config.model, apiKey: !!config.apiKey }) })
app.get('/api/config/paths', (req, res) => {
  const candidates = [
    path.join(process.cwd(), 'server', 'apikey.json'),
    path.join(process.cwd(), 'apikey.json'),
    path.join(process.cwd(), 'v3', 'apikey.json')
  ]
  res.json({ candidates: candidates.map(p => ({ path: p, exists: fs.existsSync(p) })) })
})

 

app.post('/api/auth-check', async (req, res) => {
  try {
    const model = (req.body && req.body.model) || config.model || 'moonshot-v1-8k'
    const resp = await (async () => {
      const bases = [config.baseUrl, 'https://api.moonshot.cn/v1', 'https://api.moonshot.ai/v1'].filter(Boolean)
      let last = { ok:false, status:0, body:'', base:'' }
      for (const base of bases) {
        try {
          console.log('[auth-check:req]', base + '/chat/completions', 'model=', model)
          const r = await fetch(base + '/chat/completions', { method:'POST', headers:{ 'Authorization':'Bearer ' + config.apiKey, 'Content-Type':'application/json', 'Accept':'application/json' }, body: JSON.stringify({ model, messages:[{ role:'user', content:'ping' }], stream: false, max_tokens: 8 }) })
          const txt = await r.text()
          last = { ok: r.ok, status: r.status, body: txt, base }
          console.log('[auth-check:resp]', 'status=', r.status, 'base=', base, trunc(txt, 300))
          if (r.ok) { config.baseUrl = base; break }
          try { const j = JSON.parse(txt || '{}'); const t = j && j.error && j.error.type; if (t !== 'invalid_authentication_error') break } catch {}
        } catch (e) { last = { ok:false, status:0, body:String(e && e.message || e), base } }
      }
      return last
    })()
    res.status(resp.ok ? 200 : resp.status || 500).json(resp)
  } catch (e) { res.status(500).json({ ok: false, error: String(e && e.message || e) }) }
})

app.post('/api/chat', async (req, res) => {
  try {
    const body = req.body || {}
    const messages = Array.isArray(body.messages) ? body.messages : []
    if (!messages.length || messages[0].role !== 'system') messages.unshift({ role:'system', content: SYSTEM_PROMPT })
    const model = body.model || config.model || 'moonshot-v1-8k'
    const bases = [config.baseUrl, 'https://api.moonshot.cn/v1', 'https://api.moonshot.ai/v1'].filter(Boolean)
    let ok = false, status = 0, txt = ''
    for (const base of bases) {
      for (let attempt=0; attempt<3; attempt++) {
        console.log('[chat:req]', base + '/chat/completions', 'model=', model, 'messages=', messages.length, 'attempt=', attempt+1)
        const r = await fetch(base + '/chat/completions', { method:'POST', headers:{ 'Authorization':'Bearer ' + config.apiKey, 'Content-Type':'application/json' }, body: JSON.stringify({ model, messages, stream: false }) })
        txt = await r.text(); status = r.status; ok = r.ok
        console.log('[chat:resp]', 'status=', status, 'base=', base, trunc(txt, 500))
        if (r.ok) { config.baseUrl = base; attempt = 3; break }
        let type = ''
        try { const j = JSON.parse(txt || '{}'); type = j && j.error && j.error.type || '' } catch {}
        if (status === 429 || type === 'engine_overloaded_error') { const ra = Number(r.headers.get('retry-after') || 0); const wait = ra ? ra * 1000 : 800 * (attempt + 1); await new Promise(s => setTimeout(s, wait)); continue }
        if (type === 'invalid_authentication_error') { break }
        break
      }
      if (ok) break
    }
    if (!ok) { res.status(status || 500).send(txt); return }
    let content = ''
    try {
      const j = JSON.parse(txt)
      content = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content || ''
    } catch { content = txt }
    res.json({ content })
  } catch (e) { res.status(500).json({ error: String(e && e.message || e) }) }
})

app.post('/api/chat/stream', async (req, res) => {
  try {
    const body = req.body || {}
    const messages = Array.isArray(body.messages) ? body.messages : []
    if (!messages.length || messages[0].role !== 'system') messages.unshift({ role:'system', content: SYSTEM_PROMPT })
    const model = body.model || config.model || 'moonshot-v1-8k'
    const bases = [config.baseUrl, 'https://api.moonshot.cn/v1', 'https://api.moonshot.ai/v1'].filter(Boolean)
    let baseUsed = ''
    for (const base of bases) {
      let r, txt=''
      for (let attempt=0; attempt<3; attempt++) {
        console.log('[stream:req]', base + '/chat/completions', 'model=', model, 'messages=', messages.length, 'attempt=', attempt+1)
        r = await fetch(base + '/chat/completions', { method:'POST', headers:{ 'Authorization':'Bearer ' + config.apiKey, 'Content-Type':'application/json', 'Accept':'text/event-stream' }, body: JSON.stringify({ model, messages, stream: true }) })
        if (r.ok) break
        txt = await r.text()
        console.log('[stream:resp-nok]', 'status=', r.status, 'base=', base, trunc(txt, 500))
        let type = ''
        try { const j = JSON.parse(txt || '{}'); type = j && j.error && j.error.type || '' } catch {}
        if (r.status === 429 || type === 'engine_overloaded_error') { const ra = Number(r.headers.get('retry-after') || 0); const wait = ra ? ra * 1000 : 800 * (attempt + 1); await new Promise(s => setTimeout(s, wait)); continue }
        if (type === 'invalid_authentication_error') { txt && res.status(r.status).end(txt); r = null; break }
        txt && res.status(r.status).end(txt); r = null; break
      }
      if (!r) continue
      baseUsed = base
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      config.baseUrl = baseUsed
      const reader = r.body.getReader()
      const dec = new TextDecoder('utf-8')
      let buf = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const parts = buf.split('\n')
        for (const raw of parts) {
          const line = raw.trim()
          if (!line.startsWith('data:')) continue
          const payload = line.slice(5).trim()
          if (payload === '[DONE]') { res.write('data: {"done":true}\n\n'); res.end(); return }
          try {
            const j = JSON.parse(payload)
            const d = j.choices && j.choices[0] && j.choices[0].delta
            if (d && d.content) { console.log('[stream:delta]', trunc(d.content, 180)); res.write('data: ' + JSON.stringify({ content: d.content }) + '\n\n') }
          } catch {}
        }
        buf = ''
      }
      res.end()
      return
    }
    res.status(500).json({ error: 'stream failed' })
  } catch (e) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.write('data: ' + JSON.stringify({ error: String(e && e.message || e) }) + '\n\n')
    res.end()
  }
})

app.get('/api/chat/stream', async (req, res) => {
  try {
    const q = String(req.query.q || req.query.goal || '')
    const model = String(req.query.model || config.model || 'moonshot-v1-8k')
    const messages = [ { role:'system', content: SYSTEM_PROMPT }, { role:'user', content: q } ]
    const bases = [config.baseUrl, 'https://api.moonshot.cn/v1', 'https://api.moonshot.ai/v1'].filter(Boolean)
    for (const base of bases) {
      let r, txt=''
      for (let attempt=0; attempt<3; attempt++) {
        console.log('[stream:get:req]', base + '/chat/completions', 'model=', model, 'attempt=', attempt+1)
        r = await fetch(base + '/chat/completions', { method:'POST', headers:{ 'Authorization':'Bearer ' + config.apiKey, 'Content-Type':'application/json', 'Accept':'text/event-stream' }, body: JSON.stringify({ model, messages, stream: true }) })
        if (r.ok) break
        txt = await r.text()
        console.log('[stream:get:resp-nok]', 'status=', r.status, 'base=', base, trunc(txt, 500))
        let type = ''
        try { const j = JSON.parse(txt || '{}'); type = j && j.error && j.error.type || '' } catch {}
        if (r.status === 429 || type === 'engine_overloaded_error') { const ra = Number(r.headers.get('retry-after') || 0); const wait = ra ? ra * 1000 : 800 * (attempt + 1); await new Promise(s => setTimeout(s, wait)); continue }
        if (type === 'invalid_authentication_error') { txt && res.status(r.status).end(txt); r = null; break }
        txt && res.status(r.status).end(txt); r = null; break
      }
      if (!r) continue
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')
      const reader = r.body.getReader()
      const dec = new TextDecoder('utf-8')
      let buf = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const parts = buf.split('\n')
        for (const raw of parts) {
          const line = raw.trim()
          if (!line.startsWith('data:')) continue
          const payload = line.slice(5).trim()
          if (payload === '[DONE]') { res.write('data: {"done":true}\n\n'); res.end(); return }
          try {
            const j = JSON.parse(payload)
            const d = j.choices && j.choices[0] && j.choices[0].delta
            if (d && d.content) { console.log('[stream:get:delta]', trunc(d.content, 180)); res.write('data: ' + JSON.stringify({ content: d.content }) + '\n\n') }
          } catch {}
        }
        buf = ''
      }
      res.end()
      return
    }
    res.status(500).json({ error: 'stream failed' })
  } catch (e) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.write('data: ' + JSON.stringify({ error: String(e && e.message || e) }) + '\n\n')
    res.end()
  }
})

app.post('/api/generate-plan', async (req, res) => {
  try {
    const goal = (req.body && req.body.goal) || ''
    const model = (req.body && req.body.model) || config.model || 'moonshot-v1-8k'
    const prompt = `你是项目规划助手。根据用户目标生成可导入的里程碑与任务 JSON。严格输出 JSON，顶层为 {"meta":{...},"milestones":[]}，每个里程碑包含 title、desc、dueDate 可选、tasks 数组，task 包含 text、desc 可选、done 可选。不要包含 id/order，不要附加解释。用户目标：${goal}`
    const bases = [config.baseUrl, 'https://api.moonshot.cn/v1', 'https://api.moonshot.ai/v1'].filter(Boolean)
    let ok = false, status = 0, txt = ''
    for (const base of bases) {
      for (let attempt=0; attempt<3; attempt++) {
        console.log('[generate:req]', base + '/chat/completions', 'model=', model, 'attempt=', attempt+1, 'prompt=', trunc(prompt, 200))
        const r = await fetch(base + '/chat/completions', { method:'POST', headers:{ 'Authorization':'Bearer ' + config.apiKey, 'Content-Type':'application/json' }, body: JSON.stringify({ model, messages:[{ role:'user', content: prompt }], stream: false }) })
        txt = await r.text(); status = r.status; ok = r.ok
        console.log('[generate:resp]', 'status=', status, 'base=', base, trunc(txt, 500))
        if (r.ok) { config.baseUrl = base; attempt = 3; break }
        let type = ''
        try { const j = JSON.parse(txt || '{}'); type = j && j.error && j.error.type || '' } catch {}
        if (status === 429 || type === 'engine_overloaded_error') { const ra = Number(r.headers.get('retry-after') || 0); const wait = ra ? ra * 1000 : 800 * (attempt + 1); await new Promise(s => setTimeout(s, wait)); continue }
        if (type === 'invalid_authentication_error') { break }
        break
      }
      if (ok) break
    }
    if (!ok) { res.status(status || 500).send(txt); return }
    let j = null
    try { const obj = JSON.parse(txt); const content = obj && obj.choices && obj.choices[0] && obj.choices[0].message && obj.choices[0].message.content; j = JSON.parse(content || '{}') } catch { j = null }
    if (!j || !j.milestones) { res.status(422).json({ error: 'parse failed' }); return }
    res.json(j)
  } catch (e) { res.status(500).json({ error: String(e && e.message || e) }) }
})

const port = 3001
app.listen(port, () => {
  console.log('[server] listening on http://localhost:' + port)
  console.log('[server] config baseUrl=', config.baseUrl, ' model=', config.model, ' apiKey=', config.apiKey ? 'set' : 'empty')
})
