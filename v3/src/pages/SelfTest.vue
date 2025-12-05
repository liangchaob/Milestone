<template>
  <div class="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-3">
    <div class="text-sm font-semibold">自检</div>
    <div class="text-xs text-slate-400">执行自动流程：目标→离线生成→导入DB→跳转应用→验证</div>
    <div class="text-xs text-slate-300">状态：{{ status }}</div>
    <div class="flex gap-2">
      <button class="px-3 py-2 text-sm border border-slate-700 rounded hover:border-primary" @click="run">运行</button>
      <router-link to="/app" class="px-3 py-2 text-sm border border-slate-700 rounded hover:border-primary">查看应用</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { DB } from '../db'
import { useRouter } from 'vue-router'

const router = useRouter()
const status = ref('待机')

async function run() {
  try {
    status.value = '初始化数据库'
    await DB.init()
    status.value = '生成离线计划'
    const n = 4
    const title = 'AutoTest Goal'
    const payload = { meta: { title, desc:'' }, milestones: [] }
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
    status.value = '写入数据库'
    DB.importJSON(payload)
    status.value = '跳转应用'
    router.push('/app')
  } catch (e) {
    status.value = '失败：' + String(e && e.message || e)
  }
}
</script>

<style scoped>
</style>
