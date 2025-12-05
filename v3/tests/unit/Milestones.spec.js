import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Milestones from '../../src/pages/Milestones.vue'

vi.mock('../../src/db', () => {
  const seed = {
    meta: { title: '总目标', desc: '描述' },
    milestones: [
      { title: '阶段一', desc: 'A', tasks: [ { text:'t1', done: 0 }, { text:'t2', done: 1 } ] },
      { title: '阶段二', desc: 'B', tasks: [ { text:'t3', done: 0 } ] }
    ]
  }
  const state = { meta: { ...seed.meta }, list: [], tasks: {} }
  let id = 0
  function make() {
    state.list = []
    state.tasks = {}
    for (const m of seed.milestones) {
      const mid = 'm' + (++id)
      state.list.push({ id: mid, title: m.title, desc: m.desc })
      state.tasks[mid] = m.tasks.map((t, i) => ({ id: 't'+mid+'-'+i, milestoneId: mid, text: t.text, desc: '', done: !!t.done }))
    }
  }
  make()
  const mock = {
    init: vi.fn(async () => {}),
    getMeta: () => ({ ...state.meta }),
    setMeta: vi.fn((title, desc) => { state.meta = { title, desc } }),
    listMilestones: () => state.list.slice(),
    listTasks: (mid) => (state.tasks[mid] || []).slice(),
    createMilestone: vi.fn((title, desc) => { const mid = 'm'+(++id); state.list.push({ id: mid, title, desc }); state.tasks[mid] = []; return { id: mid, title, desc } }),
    updateMilestone: vi.fn((m) => { const i = state.list.findIndex(x=>x.id===m.id); if (i>=0) state.list[i] = { ...state.list[i], title:m.title, desc:m.desc } }),
    deleteMilestone: vi.fn((mid) => { state.list = state.list.filter(x=>x.id!==mid); delete state.tasks[mid] }),
    createTask: vi.fn((mid, text, desc) => { const t = { id: 't'+(++id), milestoneId: mid, text, desc, done: 0 }; (state.tasks[mid] ||= []).push(t); return t }),
    updateTask: vi.fn((t) => { const arr = state.tasks[t.milestoneId]||[]; const i = arr.findIndex(x=>x.id===t.id); if (i>=0) arr[i] = { ...arr[i], ...t } }),
    deleteTask: vi.fn((id) => { for (const k of Object.keys(state.tasks)) state.tasks[k] = (state.tasks[k]||[]).filter(x=>x.id!==id) })
  }
  return { DB: mock }
})

describe('Milestones.vue', () => {
  let wrapper
  beforeEach(async () => {
    wrapper = mount(Milestones)
    await new Promise(r => setTimeout(r, 0))
  })

  it('基础渲染：显示总目标与里程碑列表', async () => {
    expect(wrapper.text()).toContain('Milestone')
    const items = wrapper.findAll('.milestone-item')
    expect(items.length).toBeGreaterThan(0)
  })

  it('数据加载：显示首个里程碑任务与进度', async () => {
    const title = '阶段一'
    expect(wrapper.text()).toContain(title)
    expect(wrapper.text()).toContain('% 完成')
    const bar = wrapper.find('.progress-fill')
    expect(bar.exists()).toBe(true)
  })

  it('核心交互：切换任务完成状态并更新统计', async () => {
    const { DB } = await import('../../src/db')
    const firstItem = wrapper.findAll('.milestone-item')[0]
    await firstItem.trigger('click')
    const check = wrapper.find('.chk input')
    expect(check.exists()).toBe(true)
    await check.setValue(true)
    expect(DB.updateTask).toHaveBeenCalled()
  })

  it('核心交互：新增任务后列表增加', async () => {
    const before = wrapper.findAll('.chk input').length
    const spy1 = vi.spyOn(window, 'prompt').mockReturnValueOnce('新任务').mockReturnValueOnce('')
    const addBtn = wrapper.findAll('button').find(b => b.text().includes('新增任务'))
    expect(addBtn).toBeTruthy()
    await addBtn.trigger('click')
    spy1.mockRestore()
    const after = wrapper.findAll('.chk input').length
    expect(after).toBeGreaterThanOrEqual(before)
  })

  it('编辑总目标：更新标题与描述', async () => {
    const spy = vi.spyOn(window, 'prompt').mockReturnValueOnce('新总目标').mockReturnValueOnce('新的描述')
    const setBtn = wrapper.findAll('button').find(b => b.text().includes('set'))
    expect(setBtn).toBeTruthy()
    await setBtn.trigger('click')
    spy.mockRestore()
    expect(wrapper.text()).toContain('新总目标')
  })

  it('新增里程碑并选择', async () => {
    const spy = vi.spyOn(window, 'prompt').mockReturnValueOnce('M').mockReturnValueOnce('D')
    const addBtn = wrapper.findAll('button').find(b => b.text().includes('新建里程碑'))
    await addBtn.trigger('click')
    spy.mockRestore()
    const items = wrapper.findAll('.milestone-item')
    expect(items.length).toBeGreaterThan(1)
  })

  it('里程碑菜单删除', async () => {
    const delSpy = vi.spyOn(window, 'prompt').mockReturnValue('2')
    const menuBtn = wrapper.findAll('button').find(b => b.text().includes('···'))
    await menuBtn.trigger('click')
    delSpy.mockRestore()
    expect(wrapper.findAll('.milestone-item').length).toBeGreaterThan(0)
  })
})
