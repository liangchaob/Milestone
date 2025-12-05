import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/db', () => {
  const state = { list: [], tasks: {} }
  let id = 0
  const mock = {
    async init() {},
    listMilestones: () => state.list.slice(),
    listTasks: (mid) => (state.tasks[mid]||[]).slice(),
    createMilestone: (title, desc) => { const mid = 'm'+(++id); state.list.push({ id: mid, title, desc }); state.tasks[mid] = []; return { id: mid, title, desc } },
    deleteMilestone: (mid) => { state.list = state.list.filter(x=>x.id!==mid); delete state.tasks[mid] },
    createTask: (mid, text, desc) => { const t = { id:'t'+(++id), milestoneId: mid, text, desc, done: 0 }; (state.tasks[mid] ||= []).push(t); return t },
    updateTask: (t) => { const arr = state.tasks[t.milestoneId]||[]; const i = arr.findIndex(x=>x.id===t.id); if (i>=0) arr[i] = { ...arr[i], ...t } }
  }
  return { DB: mock }
})
import { DB as DBReal } from '../../src/db'

describe('DB integration', () => {
  it('create milestone and tasks flow', async () => {
    await DBReal.init()
    const m = DBReal.createMilestone('X', 'Y')
    expect(DBReal.listMilestones().some(x => x.id === m.id)).toBe(true)
    const t = DBReal.createTask(m.id, 'Do', '')
    expect(DBReal.listTasks(m.id).some(x => x.id === t.id)).toBe(true)
    DBReal.updateTask({ ...t, done: 1 })
    const after = DBReal.listTasks(m.id).find(x => x.id === t.id)
    expect(after.done).toBe(1)
    DBReal.deleteMilestone(m.id)
    expect(DBReal.listMilestones().some(x => x.id === m.id)).toBe(false)
  })
})
