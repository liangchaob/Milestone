<template>
  <div class="max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
    <div class="flex items-center justify-between mb-3">
      <div class="text-sm font-semibold">对话</div>
      <a href="/app" class="text-xs underline">返回应用</a>
    </div>
    <div class="text-xs text-slate-400 mb-2">目标：{{ goal }}</div>
    <div ref="chatBox" class="h-96 overflow-auto border border-slate-700 rounded bg-slate-900 p-3 mb-3 space-y-2">
      <div v-for="m in msgs" :key="m.id" :class="m.who==='ai' ? 'flex justify-start' : 'flex justify-end'">
        <div :class="m.who==='ai' ? 'bg-slate-800 border border-slate-700 px-3 py-2 rounded w-fit max-w-[85%] whitespace-pre-wrap break-words' : 'bg-slate-700 border border-slate-600 px-3 py-2 rounded w-fit max-w-[85%] whitespace-pre-wrap break-words'">
          <span>{{ m.text }}</span>
          <span v-if="m.who==='ai' && streaming && streamingAiId===m.id" class="ml-2 text-xs text-slate-400">{{ loaderDots }}</span>
        </div>
      </div>
      <div ref="endAnchor"></div>
    </div>
    <div class="flex gap-2 mb-3">
      <input v-model="input" @keydown.enter.prevent="send" class="flex-1 px-3 py-2 rounded border border-slate-700 bg-slate-900 text-slate-100" placeholder="在此输入，与大模型对话" />
      <button class="px-3 py-2 text-sm border border-slate-700 rounded hover:border-primary" :disabled="loading" @click="send">发送</button>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const goal = ref(decodeURIComponent(route.query.goal || ''))

const msgs = ref([])
const input = ref('')
const loading = ref(false)

const chatBox = ref(null)
const endAnchor = ref(null)
const streaming = ref(false)
const streamingAiId = ref('')
const chatCtx = ref([])
const msgKey = computed(() => msgs.value.map(m => m.id + ':' + (m.text ? m.text.length : 0)).join('|'))
watch(msgKey, async () => { await scrollBottom() })
const loaderDots = ref('...')
let loaderTimer = null
watch(streaming, (val) => {
  try { if (loaderTimer) { clearInterval(loaderTimer); loaderTimer = null } } catch {}
  loaderDots.value = '...'
  if (val) {
    loaderTimer = setInterval(() => {
      const n = loaderDots.value.length
      if (n >= 6) loaderDots.value = '...'
      else loaderDots.value = loaderDots.value + '.'
    }, 400)
  }
})

function maskKey(k) { const s = (k||'').trim(); if (!s) return ''; return s.slice(0,6) + '...' + s.slice(-4) }
async function scrollBottom() {
  await nextTick()
  try {
    const el = chatBox.value
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'auto' })
      requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: 'auto' }))
    }
    const a = endAnchor.value
    if (a) a.scrollIntoView({ behavior: 'auto', block: 'end' })
  } catch {}
}
function pushMsg(text, who) { const m = { id: Math.random().toString(36).slice(2), text, who }; msgs.value.push(m); scrollBottom() }

async function backendChat(userText) {
  const body = { messages: [{ role:'system', content:'你是项目规划助手，围绕用户目标进行结构化对话。' }, { role:'user', content: userText }] }
  const r = await fetch('/api/chat', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
  if (!r.ok) { const txt = await r.text(); throw new Error('HTTP ' + r.status + ' ' + txt) }
  const j = await r.json()
  return j && j.content || ''
}

async function streamChatViaFetch(messages, onDelta) {
  const r = await fetch('/api/chat/stream', { method:'POST', headers:{ 'Content-Type':'application/json', 'Accept':'text/event-stream' }, body: JSON.stringify({ messages }) })
  if (!r.ok) { const txt = await r.text(); throw new Error('HTTP ' + r.status + ' ' + txt) }
  const reader = r.body.getReader(); const dec = new TextDecoder('utf-8'); let buf=''; let acc=''
  while (true) { const { value, done } = await reader.read(); if (done) break; buf += dec.decode(value, { stream:true }); const parts = buf.split('\n'); for (const raw of parts) { const line = raw.trim(); if (!line.startsWith('data:')) continue; const payload = line.slice(5).trim(); if (payload === '[DONE]') { return acc } try { const j = JSON.parse(payload); if (j && j.done) return acc; const d = j && j.content; if (d) { acc += d; onDelta(d); await scrollBottom() } } catch {} } buf='' }
  return acc
}

async function streamChat(messages, onDelta) { return await streamChatViaFetch(messages, onDelta) }

async function send() {
  const t = (input.value || '').trim(); if (!t) return; loading.value = true; pushMsg(t, 'user'); input.value=''; const am = { id: Math.random().toString(36).slice(2), text:'', who:'ai' }; msgs.value.push(am); streaming.value = true; streamingAiId.value = am.id
  try { chatCtx.value.push({ role:'user', content: t }); const toSend = chatCtx.value.slice(); await streamChat(toSend, (delta) => { am.text += delta }); chatCtx.value.push({ role:'assistant', content: am.text }) } catch (err) { am.text = '失败：' + String(err && err.message || err) } finally { loading.value = false; streaming.value = false; streamingAiId.value = '' }
}

async function checkBackend() {
  try {
    let r = await fetch('/api/config/detail')
    if (!r.ok) {
      r = await fetch('/api/health')
      if (!r.ok) { backendStatus.value = '不可用'; return }
      backendStatus.value = '可用但未读取配置'; return
    }
    const j = await r.json()
    backendStatus.value = (j.apiKey ? '已配置' : '未配置') + (j.baseUrl ? ` · ${j.baseUrl}` : '')
  } catch (e) { backendStatus.value = '不可用' }
}
async function showConfigPaths() { try { const r = await fetch('/api/config/paths'); const j = await r.json(); const lines = (j.candidates || []).map(x => `${x.exists ? '✓' : '×'} ${x.path}`); pushMsg('配置路径检测:\n' + lines.join('\n'), 'ai') } catch (e) { pushMsg('配置路径检测失败：' + String(e && e.message || e), 'ai') } }
async function reloadBackend() { try { await fetch('/api/config/reload', { method:'POST' }); await checkBackend() } catch {} }

async function pickConfigFile() {
  if (window.showOpenFilePicker) { try { const [h] = await window.showOpenFilePicker({ types:[{ description:'JSON', accept:{ 'application/json':['.json'] } }] }); const f = await h.getFile(); const txt = await f.text(); const j = JSON.parse(txt); model.value = (j.model || model.value || ''); apiKey.value = (j.api_key || j.key || apiKey.value || ''); baseUrl.value = (j.base_url || baseUrl.value || 'https://api.moonshot.cn/v1'); source.value='picked'; return true } catch { return false } } else { return await pickViaInput() } }
function pickViaInput() { return new Promise((resolve) => { const inp = document.createElement('input'); inp.type='file'; inp.accept='.json,application/json'; inp.style.display='none'; inp.onchange = async () => { try { const f = inp.files && inp.files[0]; if (!f) { resolve(false); return } const txt = await f.text(); const j = JSON.parse(txt); model.value = (j.model || model.value || ''); apiKey.value = (j.api_key || j.key || apiKey.value || ''); baseUrl.value = (j.base_url || baseUrl.value || 'https://api.moonshot.cn/v1'); source.value='picked'; resolve(true) } catch { resolve(false) } document.body.removeChild(inp) }; document.body.appendChild(inp); inp.click(); setTimeout(() => { try { document.body.removeChild(inp) } catch {} resolve(false) }, 10000) }) }

async function loadConfigFile() { const ok1 = await loadViaFetch('/apikey.json?ts=' + Date.now()); const ok2 = ok1 ? true : await loadViaXHR('/apikey.json?ts=' + Date.now()); const ok3 = ok2 ? true : await loadConfigIframe('/apikey.json?ts=' + Date.now()); source.value = (ok1||ok2||ok3) ? 'file' : '' }

function localPlanFromGoal() {
  const title = goal.value || '我的目标'
  const desc = ''
  const n = 4
  const payload = { meta: { title, desc }, milestones: [] }
  for (let i=0; i<n; i++) {
    const phase = ['准备','方案/设计','执行','验证/交付'][i] || `阶段 ${i+1}`
    const mTitle = `${i+1}/${n}：${phase}`
    const tasks = [
      { text: `围绕「${title}」明确本阶段目标` },
      { text: '梳理任务与依赖关系' },
      { text: '执行关键事项' },
      { text: '产出阶段成果与记录' },
      { text: '评审并准备进入下一阶段' }
    ]
    payload.milestones.push({ title: mTitle, desc: `基于目标：${title}`, dueDate: '', tasks })
  }
  return payload
}

async function generatePlan() {
  loading.value = true
  try {
    const r = await fetch('/api/generate-plan', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ goal: goal.value }) })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    const j = await r.json()
    if (!j || !j.milestones) throw new Error('解析失败')
    await DB.init(); DB.importJSON(j)
    router.push('/app')
  } catch (err) {
    pushMsg('生成失败：' + String(err && err.message || err) + '，正尝试离线生成...', 'ai')
    await generatePlanOffline()
  }
  finally { loading.value = false }
}

async function generatePlanOffline() {
  loading.value = true
  try {
    const payload = localPlanFromGoal()
    await DB.init(); DB.importJSON(payload)
    router.push('/app')
  } finally { loading.value = false }
}

async function sendGoalAuto() {
  const t = (goal.value || '').trim(); if (!t) return; loading.value = true; const am = { id: Math.random().toString(36).slice(2), text:'', who:'ai' }; msgs.value.push(am); streaming.value = true; streamingAiId.value = am.id
  try { chatCtx.value.push({ role:'user', content: t }); const toSend = chatCtx.value.slice(); await streamChat(toSend, (delta) => { am.text += delta }); chatCtx.value.push({ role:'assistant', content: am.text }) } catch (err) { am.text = '失败：' + String(err && err.message || err) } finally { loading.value = false; streaming.value = false; streamingAiId.value = '' }
}

async function authCheck() {
  try {
    const r = await fetch('/api/auth-check', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({}) })
    const j = await r.json().catch(() => ({}))
    pushMsg(`鉴权：${j.ok ? '成功' : '失败'} · 状态 ${j.status} · ${j.body ? j.body.slice(0,200) : ''}`, 'ai')
  } catch (e) {
    pushMsg('鉴权异常：' + String(e && e.message || e), 'ai')
  }
}

onMounted(async () => {
  if (goal.value) { await sendGoalAuto() }
})
</script>

<style scoped>
</style>
