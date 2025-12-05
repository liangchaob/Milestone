<template>
  <div class="grid grid-cols-[320px_1fr] gap-4">
    <div class="sidebar">
      <div class="panel-header">
        <div class="panel-title">Milestone</div>
        <div class="panel-actions">
          <button class="icon-btn" title="新建" @click="addMilestone">＋</button>
          <button class="icon-btn" title="刷新" @click="reload">⟳</button>
        </div>
      </div>
      <div class="panel-progress">
        <div class="gauge" :style="overallGaugeStyle"><div class="gauge-inner">{{ overallPercent }}%</div></div>
        <div class="progress-label">总进度</div>
      </div>
      <div class="ml-list">
        <div v-for="m in milestones" :key="m.id" :class="['milestone-item','ml-item', currentId===m.id ? 'active' : '']" @click="select(m.id)">
          <div class="ml-title">{{ m.title }}</div>
          <div class="ml-sub">进度：{{ percentFor(m.id) }}% · TODO：{{ stats[m.id]?.todo || 0 }}</div>
        </div>
      </div>
    </div>
    <div class="detail-panel">
      <div v-if="currentMilestone">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="detail-title">{{ currentMilestone.title }}</div>
            <div class="detail-sub">{{ currentMilestone.desc }}</div>
          </div>
          <div class="detail-actions"><span>{{ currentPercent }}% 完成</span><button class="icon-btn" @click="editMilestone(currentMilestone)">···</button></div>
        </div>
        <div class="detail-progress mb-4"><div class="detail-progress-fill" :style="{ width: currentPercent + '%' }"></div></div>
        <div class="task-list">
          <div v-for="t in tasks" :key="t.id" class="task-row">
            <label class="chk">
              <input type="checkbox" :checked="t.done" @change="toggleTask(t)" />
              <span class="box"></span>
            </label>
            <div class="task-main">
              <div class="task-title" :class="t.done ? 'done' : ''">{{ t.text }}</div>
              <div v-if="t.desc" class="task-desc">{{ t.desc }}</div>
            </div>
            <button class="icon-btn" @click="taskMenu(t)">···</button>
          </div>
        </div>
        <div class="mt-3"><button class="link-btn" @click="addTask">新增任务</button></div>
        
      </div>
      <div v-else class="text-xs text-slate-400">选择左侧里程碑以查看任务</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { DB } from '../db'

const milestones = ref([])
const currentId = ref(null)
const tasks = ref([])
const stats = ref({})
const metaTitle = ref('')
const metaDesc = ref('')


const currentMilestone = computed(() => milestones.value.find(x => x.id === currentId.value))
const currentPercent = computed(() => {
  const s = stats.value[currentId.value || '']
  if (!s) return 0
  const total = s.total || 0
  const done = s.done || 0
  if (!total) return 0
  return Math.round(done * 100 / total)
})
const overallPercent = computed(() => {
  const ids = milestones.value.map(m => m.id)
  let total = 0, done = 0
  for (const id of ids) {
    const s = stats.value[id]
    if (!s) continue
    total += s.total || 0
    done += s.done || 0
  }
  if (!total) return 0
  return Math.round(done * 100 / total)
})
const overallGaugeStyle = computed(() => {
  const p = overallPercent.value
  const deg = Math.round(p * 3.6)
  return { background: `conic-gradient(var(--primary) ${deg}deg, rgba(14,165,233,0.15) 0deg)` }
})

async function reload() {
  await DB.init()
  milestones.value = DB.listMilestones()
  const meta = DB.getMeta()
  metaTitle.value = meta.title || ''
  metaDesc.value = meta.desc || ''
  await computeStats()
  if (!currentId.value && milestones.value.length) currentId.value = milestones.value[0].id
  await loadTasks()
}

async function loadTasks() {
  if (!currentId.value) { tasks.value = []; return }
  tasks.value = DB.listTasks(currentId.value)
}

async function computeStats() {
  const m = {}
  for (const x of milestones.value) {
    const ts = DB.listTasks(x.id)
    const total = ts.length
    const done = ts.filter(t => t.done).length
    const todo = ts.filter(t => !t.done).length
    m[x.id] = { total, done, todo }
  }
  stats.value = m
}

function percentFor(id) {
  const s = stats.value[id]
  if (!s || !s.total) return 0
  return Math.round((s.done || 0) * 100 / s.total)
}

function select(id) { currentId.value = id; loadTasks() }

async function addMilestone() {
  const title = window.prompt('标题') || ''
  const desc = window.prompt('描述') || ''
  if (!title.trim()) return
  DB.createMilestone(title, desc)
  await reload()
}

async function addTask() {
  if (!currentId.value) return
  const text = window.prompt('任务内容') || ''
  const desc = window.prompt('其他(可选)') || ''
  if (!text.trim()) return
  DB.createTask(currentId.value, text, desc)
  await loadTasks()
  await computeStats()
}

async function toggleTask(t) {
  DB.updateTask({ ...t, done: !t.done })
  await loadTasks()
  await computeStats()
}

async function removeTask(id) {
  DB.deleteTask(id)
  await loadTasks()
  await computeStats()
}

function milestoneMenu(m) {
  const op = (window.prompt('输入 1 编辑 / 2 删除') || '').trim()
  if (op === '2') { DB.deleteMilestone(m.id); reload(); return }
  if (op === '1') editMilestone(m)
}
function editMilestone(m) {
  const title = window.prompt('里程碑标题', m.title || '') || ''
  const desc = window.prompt('里程碑描述', m.desc || '') || ''
  if (!title.trim()) return
  DB.updateMilestone({ ...m, title, desc })
  reload()
}
function taskMenu(t) {
  const op = (window.prompt('输入 1 编辑 / 2 删除') || '').trim()
  if (op === '2') { removeTask(t.id); return }
  if (op === '1') editTask(t)
}
function editTask(t) {
  const text = window.prompt('任务内容', t.text || '') || ''
  const desc = window.prompt('其他(可选)', t.desc || '') || ''
  if (!text.trim()) return
  DB.updateTask({ ...t, text, desc })
  loadTasks().then(() => computeStats())
}
function editMeta() {
  const title = window.prompt('总目标标题', metaTitle.value || '') || ''
  const desc = window.prompt('总目标描述', metaDesc.value || '') || ''
  if (!title.trim()) return
  DB.setMeta(title, desc)
  reload()
}

onMounted(reload)
</script>

<style scoped>
.detail-panel { padding: 16px; background: transparent; border: none }
.sidebar { background: #0b0e14; border: none; border-radius: 0; padding: 16px; margin: 0; height: 100vh; position: sticky; top: 0; overflow: hidden; display: flex; flex-direction: column; }
.panel-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px }
.panel-title { font-size: 12px; font-weight: 700; color: #ff7f50 }
.panel-actions { display:flex; gap:8px }
.icon-btn { padding:4px 8px; font-size:11px; border:1px solid #334155; border-radius:6px; background:transparent; color:#cbd5e1; cursor:pointer }
.icon-btn:hover { color: var(--primary); border-color: var(--primary) }
.panel-progress { display:grid; place-items:center; gap:6px; padding:8px; border:1px solid #334155; border-radius:8px; background:#0b0e14; margin-bottom:12px }
.progress-label { font-size:11px; color:#94a3b8 }
.ml-list { display:flex; flex-direction:column; gap:6px }
.ml-item { padding:8px 10px; border:1px solid #1f2937; border-radius:8px; background:#0f172a }
.ml-item.active { border-color: var(--primary); box-shadow: 0 0 12px rgba(183,255,60,0.2); background:#0b1016 }
.ml-title { font-size:12px; font-weight:700; color:#cbd5e1; line-height:1.4 }
.ml-sub { font-size:10px; color:#94a3b8; margin-top:2px }
.detail-title { font-size:16px; font-weight:800; color:#cbd5e1 }
.detail-sub { font-size:11px; color: var(--text-sub) }
.detail-actions { display:flex; align-items:center; gap:8px; font-size:11px; color:#cbd5e1 }
.detail-progress { height:4px; border-radius:999px; background:#1e2638 }
.detail-progress-fill { height:100%; background: var(--primary); border-radius:999px; box-shadow: 0 0 8px rgba(183,255,60,0.25) }
.task-list { display:flex; flex-direction:column; gap:8px }
.task-row { display:flex; align-items:flex-start; gap:10px; padding:10px 12px; border:1px solid #334155; border-radius:8px; background:rgba(11,16,22,0.6) }
.task-main { flex:1 }
.task-title { font-size:12px; color:#cbd5e1 }
.task-title.done { text-decoration: line-through; color:#cbd5e1 }
.task-desc { font-size:11px; color: var(--text-sub) }
.link-btn { padding:4px 8px; font-size:12px; border:1px solid #334155; border-radius:6px; background:transparent; color:#94a3b8; cursor:pointer }
.link-btn:hover { color:#cbd5e1; border-color: var(--primary) }
.gauge { position: relative; border-radius: 9999px; background: conic-gradient(var(--primary) 0deg, rgba(14,165,233,0.15) 0deg); display: grid; place-items: center; border: 1px solid #1f2937 }
.gauge-inner { width: 70%; height: 70%; border-radius: 9999px; background: #0b0e14; display: grid; place-items: center; font-size: 10px; font-weight: 700; color: #cbd5e1; border: 1px solid #334155 }
.chk { display: inline-flex; align-items: center; justify-content: center }
.chk input { position: absolute; opacity: 0; pointer-events: none }
.chk .box { width: 16px; height: 16px; border-radius: 4px; border: 1px solid #334155; background: #0f172a; display: inline-block; position: relative }
.chk input:checked + .box { background: var(--primary); border-color: var(--primary) }
.chk input:checked + .box::after { content: ''; position: absolute; left: 4px; top: 1px; width: 6px; height: 10px; border: 2px solid white; border-top: 0; border-left: 0; transform: rotate(45deg) }
</style>
