import initSqlJs from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { nanoid } from 'nanoid'

let SQL = null
let db = null

function encode(u8) {
  let s = ''
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i])
  return btoa(s)
}

function decode(b64) {
  const s = atob(b64)
  const u8 = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i)
  return u8
}

async function init() {
  if (!SQL) SQL = await initSqlJs({ locateFile: () => wasmUrl })
  const saved = localStorage.getItem('milestone.sqlite')
  db = saved ? new SQL.Database(decode(saved)) : new SQL.Database()
  db.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, title TEXT, desc TEXT)')
  db.exec('CREATE TABLE IF NOT EXISTS milestones (id TEXT PRIMARY KEY, title TEXT, desc TEXT, dueDate TEXT, createdAt INTEGER, "order" INTEGER, completedAt TEXT)')
  db.exec('CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, milestoneId TEXT, text TEXT, desc TEXT, done INTEGER, createdAt INTEGER, "order" INTEGER)')
  const r = db.exec('SELECT COUNT(1) AS c FROM meta WHERE key="global"')
  const c = r.length && r[0].values.length ? r[0].values[0][0] : 0
  if (!c) db.exec("INSERT INTO meta (key, title, desc) VALUES ('global','总目标','针对目标的描述...')")
  await seedIfEmpty()
  persist()
}

function persist() {
  const data = db.export()
  localStorage.setItem('milestone.sqlite', encode(data))
}

function getMeta() {
  const r = db.exec('SELECT key, title, desc FROM meta WHERE key="global"')
  if (!r.length || !r[0].values.length) return { key:'global', title:'总目标', desc:'针对目标的描述...' }
  const v = r[0].values[0]
  return { key:'global', title: v[1] || '', desc: v[2] || '' }
}

function setMeta(title, desc) {
  db.exec("INSERT INTO meta (key, title, desc) VALUES ('global', $title, $desc) ON CONFLICT(key) DO UPDATE SET title=$title, desc=$desc", { $title: title || '', $desc: desc || '' })
  persist()
}

function listMilestones() {
  const r = db.exec('SELECT id, title, desc, dueDate, createdAt, "order", completedAt FROM milestones ORDER BY COALESCE("order", createdAt)')
  if (!r.length) return []
  const rows = r[0].values
  return rows.map(v => ({ id: v[0], title: v[1], desc: v[2], dueDate: v[3], createdAt: v[4], order: v[5], completedAt: v[6] }))
}

function createMilestone(title, desc, dueDate = '') {
  const id = nanoid()
  const createdAt = Date.now()
  const cnt = db.exec('SELECT COUNT(1) FROM milestones')
  const order = cnt.length ? cnt[0].values[0][0] : 0
  db.exec('INSERT INTO milestones (id, title, desc, dueDate, createdAt, "order") VALUES ($id,$title,$desc,$dueDate,$createdAt,$order)', { $id:id, $title:title||'', $desc:desc||'', $dueDate:dueDate||'', $createdAt:createdAt, $order:order })
  persist()
  return { id, title, desc, dueDate, createdAt, order }
}

function updateMilestone(m) {
  db.exec('UPDATE milestones SET title=$title, desc=$desc, dueDate=$dueDate, "order"=$order, completedAt=$completedAt WHERE id=$id', { $id:m.id, $title:m.title||'', $desc:m.desc||'', $dueDate:m.dueDate||'', $order: typeof m.order === 'number' ? m.order : null, $completedAt: m.completedAt || null })
  persist()
}

function deleteMilestone(id) {
  db.exec('DELETE FROM tasks WHERE milestoneId=$id', { $id:id })
  db.exec('DELETE FROM milestones WHERE id=$id', { $id:id })
  persist()
}

function listTasks(milestoneId) {
  const r = db.exec('SELECT id, milestoneId, text, desc, done, createdAt, "order" FROM tasks WHERE milestoneId=$mid ORDER BY COALESCE("order", createdAt)', { $mid: milestoneId })
  if (!r.length) return []
  return r[0].values.map(v => ({ id: v[0], milestoneId: v[1], text: v[2], desc: v[3], done: !!v[4], createdAt: v[5], order: v[6] }))
}

function createTask(milestoneId, text, desc) {
  const id = nanoid()
  const createdAt = Date.now()
  const r = db.exec('SELECT COUNT(1) FROM tasks WHERE milestoneId=$mid', { $mid: milestoneId })
  const order = r.length ? r[0].values[0][0] : 0
  db.exec('INSERT INTO tasks (id, milestoneId, text, desc, done, createdAt, "order") VALUES ($id,$mid,$text,$desc,$done,$createdAt,$order)', { $id:id, $mid:milestoneId, $text:text||'', $desc:desc||'', $done:0, $createdAt:createdAt, $order:order })
  persist()
  return { id, milestoneId, text, desc, done: 0, createdAt, order }
}

function updateTask(t) {
  db.exec('UPDATE tasks SET text=$text, desc=$desc, done=$done, "order"=$order WHERE id=$id', { $id:t.id, $text:t.text||'', $desc:t.desc||'', $done: t.done ? 1 : 0, $order: typeof t.order === 'number' ? t.order : null })
  persist()
}

function deleteTask(id) {
  db.exec('DELETE FROM tasks WHERE id=$id', { $id:id })
  persist()
}

function importJSON(data) {
  const isNew = typeof data === 'object' && !Array.isArray(data) && Array.isArray(data.milestones)
  const items = isNew ? (data.milestones || []) : (Array.isArray(data) ? data : [])
  db.exec('DELETE FROM tasks')
  db.exec('DELETE FROM milestones')
  if (isNew) db.exec('INSERT INTO meta (key, title, desc) VALUES (\'global\', $title, $desc) ON CONFLICT(key) DO UPDATE SET title=$title, desc=$desc', { $title: (data.meta && data.meta.title) || '', $desc: (data.meta && data.meta.desc) || '' })
  let mi = 0
  for (const m of items) {
    const mid = nanoid()
    db.exec('INSERT INTO milestones (id, title, desc, dueDate, createdAt, "order") VALUES ($id,$title,$desc,$dueDate,$createdAt,$order)', { $id:mid, $title:m.title||'', $desc:m.desc||'', $dueDate:m.dueDate||'', $createdAt:Date.now(), $order:mi++ })
    let ti = 0
    for (const t of (m.tasks || [])) {
      db.exec('INSERT INTO tasks (id, milestoneId, text, desc, done, createdAt, "order") VALUES ($id,$mid,$text,$desc,$done,$createdAt,$order)', { $id:nanoid(), $mid:mid, $text:t.text||'', $desc:t.desc||'', $done: t.done ? 1 : 0, $createdAt: Date.now(), $order: ti++ })
    }
  }
  persist()
}

function exportJSON() {
  const ms = listMilestones()
  const meta = getMeta()
  const payload = { meta: { title: meta.title || '', desc: meta.desc || '' }, milestones: [] }
  for (const m of ms) {
    const ts = listTasks(m.id)
    payload.milestones.push({ title: m.title, desc: m.desc, dueDate: m.dueDate || '', tasks: ts.map(t => ({ text: t.text, desc: t.desc || '', done: !!t.done })) })
  }
  return payload
}

export const DB = { init, getMeta, setMeta, listMilestones, createMilestone, updateMilestone, deleteMilestone, listTasks, createTask, updateTask, deleteTask, importJSON, exportJSON }

function defaultSeed() {
  return [
    { title: '第一阶段：需求分析', desc: '梳理核心功能点，确定技术栈', tasks: [ { text:'收集用户痛点', done: 1 }, { text:'绘制界面草图', done: 1 }, { text:'确定数据库结构', done: 0 } ] },
    { title: '第二阶段：核心开发', desc: '完成主要功能的编码工作', tasks: [ { text:'搭建开发环境', done: 0 }, { text:'编写前端页面', done: 0 }, { text:'后端API接口开发', done: 0 }, { text:'数据库连接测试', done: 0 } ] },
    { title: '第三阶段：测试与上线', desc: '修复Bug并部署到生产环境', tasks: [ { text:'单元测试', done: 0 }, { text:'用户验收测试', done: 0 }, { text:'编写说明文档', done: 0 } ] }
  ]
}

async function seedIfEmpty() {
  const r = db.exec('SELECT COUNT(1) FROM milestones')
  const count = r.length ? r[0].values[0][0] : 0
  if (count > 0) return
  let mi = 0
  for (const m of defaultSeed()) {
    const mid = nanoid()
    db.exec('INSERT INTO milestones (id, title, desc, dueDate, createdAt, "order") VALUES ($id,$title,$desc,$dueDate,$createdAt,$order)', { $id:mid, $title:m.title, $desc:m.desc, $dueDate:'', $createdAt:Date.now(), $order:mi++ })
    let ti = 0
    for (const t of m.tasks) {
      db.exec('INSERT INTO tasks (id, milestoneId, text, desc, done, createdAt, "order") VALUES ($id,$mid,$text,$desc,$done,$createdAt,$order)', { $id:nanoid(), $mid:mid, $text:t.text, $desc:'', $done: t.done ? 1 : 0, $createdAt: Date.now(), $order: ti++ })
    }
  }
}

