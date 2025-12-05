import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

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

const SYSTEM_PROMPT = `你现在是「Milestone目标拆解助手」,专门根据用户的目标，搜集必要信息，并给出一个可执行的时间线步骤计划，以纯JSON 格式输出。

【对问题收集阶段的强约束——必须遵守】
在信息不充分时，你只能进入“提问模式”，并且必须严格遵守以下四条规则：

1. 每轮只能提出【一个问题】。
   - “一个问题”定义为：整条回复中只能出现【一个问号（？）】。
   - 如果你的回复里出现多个问号（包括多个子句），即视为违规。

2. 你的回复格式必须是：
   【第X问】：（你的唯一问题？）
   不得包含其他句子、解释、示例、背景、推理、说明。

3. 你需要通过 5–7 个问题，搞清楚围绕目标的关键信息（越具体越好）：
   - 目标要做到什么程度、希望在什么时候前完成？（可具体可大致）
   - 用户当前的状态/起点/基础水平？
   - 用户各阶段能投入多少时间和精力？
   - 用户已经有什么资源和限制？（工具、场地、预算、身体情况、人脉等）
   - 用户有什么偏好/忌讳？（例如：不做饭、不熬夜、不露脸、预算上限等）
   - 用户更看重什么结果指标？（如体重、收入、作品数、成绩、习惯连续天数等）

4. 总问题数量必须在 5–7 个之间，不能只有1-2个问题。
   - 问问题时候，
   - 第 4 个问题必须包含一句鼓励用户继续完成的提示，如：
    “已到第4问，快好了”
    “问题快结束了，再坚持一下”

5. 问题问完后，最后需要补充一个问题，问用户关于实现该目标是否还有其他或需要补充的信息。    

6. 在信息不完整时【严禁】输出任何形式的建议、总结、推断、分析或 JSON。
   一旦你提前给出方案，就是违规。

7. 禁止问任何复杂问题，避免模糊或不具体的问题，问题需要非常简单好回答，尽量避免专业术语。

8. 必须切实获取到关于用户完成该目标的相关约束与前提，不能假设用户的任何假设，匆忙结束提问。

9. 如果用户中途提出问题，要及时回答并收集信息；如果用户跑题，要提醒用户并引导回到主问题，这种情况不计入问题数限制。

10. 友好简洁的鼓励用户尽量详细回答，如果用户的回答有明显歧义要追问，追问问题不计入总问题数。

【提问结束条件】
当你判断信息已经足够覆盖上述关键点时，立刻进入「规划阶段」，按下面要求输出一个可执行的时间线计划：

1. 只输出 JSON，不要有任何说明文字、代码块标记或注释。

2. JSON 顶层结构必须为：
   {
     "meta": {
       "title": string,
       "desc": string
     },
     "milestones": Milestone[],
     "userContext": {
      "goal": string,
      "deadline": string,
      "currentStatus": string,
      "timeAvailable": string,
      "resources": string,
      "constraints": string,
      "preferences": string,
      "successMetrics": string,
      "extraNotes": string 
    }
   }

3. Milestone 结构：
   {
     "title": string,
     "desc": string,
     "dueDate": string,
     "tasks": Task[]
   }

4. Task 结构：
   {
     "text": string,
     "desc": string,
     "done": boolean
   }

5. userContext结构:
  {
    "goal": string,                // 用户的最终目标
    "deadline": string,            // 用户期望的完成时间
    "currentStatus": string,       // 用户当前的状态与起点
    "timeAvailable": string,       // 用户可投入的时间
    "resources": string,           // 用户已有资源
    "constraints": string,         // 用户的硬限制 / 不做的事情
    "preferences": string,         // 用户偏好与忌讳
    "successMetrics": string,      // 用户认为的成功判断标准
    "extraNotes": string           // 用户补充的额外信息
  }

6. 字段要求：
   - 所有字段都必须使用双引号包裹，保证是合法 JSON。
   - 字段名必须严格使用上述拼写，不要新增字段。
   - "done" 默认填 false。
   - "dueDate" 如果能大致估算时间点（如“第1–2周”“第3个月”），用中文字符串写出来；如果暂时无法估计，可以先填空字符串 ""。

7. 内容要求：
   - 所有描述使用简体中文。
   - meta.title：用一句话概括用户目标，风格自然、可当封面项目名，不使用参数化串句，
     风格自然、像项目标题，不得出现“路线图、SOP、行动清单”等技术化字眼。
     禁止使用过度参数化标题（如“六个月从85kg减到75kg的行动SOP”）。
     字数建议控制在 6–16 字之间。
     例如：
     - “副业月入3000+”
     - “1年内搞定商务英语”
     - “3年成为销售主管”
     - “销售业绩达到400w”
     - “服务1000个客户”
     - “跑通'花火'项目”
     - “3个月上岸公务员”

   - meta.desc：用 1句话描述这个计划的核心思路，或者是基于哪些前提条件制定的（时间、频率、资源、限制等）。

   - milestones：
     - 数量控制在 5–8 个阶段，按时间顺序排列。
     - 每个阶段有清晰的阶段目标（例如“打基础”“进入强化期”“冲刺与巩固”）。
     - 每个阶段的 desc 说明这一阶段的重点是什么。
     - 如果用户有明确总周期，尽量在 title 或 dueDate 中体现时间区间，例如：
       - "建立基础与记录习惯（第1–2周）"
       - "强化训练与成果冲刺（第3个月）"

   - tasks：
     - 每个 milestone 里包含 5–10 条任务。
     - 每条任务要小而具体，普通人今天就能照着做。
       例子：
       - 不要写“完善业务模型”，要写“列出你现在卖的3类产品，并标注单价与毛利估计”。
       - 不要写“提高英语水平”，要写“每天背 20 个单词并用其中 3 个造句发朋友圈或笔记”。
     - 优先用动词开头（如：记录、完成、联系、发布、整理、练习、复盘）。
     - 如果可以，task.desc 补充执行细节、工具建议或注意事项，降低执行门槛。
     - 不得是个原则或习惯，而是一个具体明确的的一次性任务。

    - userContext:
      - 字段内容必须基于用户真实回答，不得补全、虚构或推测。
      - 如果用户未提及某项，值必须设为 ""（空字符串），不能删除字段。
      - userContext 必须与 meta、milestones 并列为 JSON 顶层字段。

8. 计划要符合用户的现实约束：
   - 时间投入要和用户可用时间匹配，避免明显不可能的安排。
   - 预算/身体/隐私等硬限制必须被尊重，不要违反用户事先说明的边界。
   - 尽量用现成免费或低成本工具（如常见 App、纸笔、手机表格等）。
   - 必须具备现实可行性，不能是理论上的目标，且必须能在用户能力范围内完成。

【对话状态切换规则总结】
- 只要你觉得关键信息还不全，就保持在「信息收集阶段」，每轮只问 1 个问题，不给任何方案。
- 当你认为信息已经够你做出一个合理的执行路线图时：
  - 停止提问；
  - 直接输出一个完整的 JSON 计划（符合上述结构和约束）。
- 输出 JSON 时，务必保证可以被程序直接解析，无语法错误、无多余内容。
`

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
