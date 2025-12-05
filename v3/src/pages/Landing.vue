<template>
  <div class="max-w-2xl mx-auto bg-slate-800 border border-slate-700 rounded-lg p-6">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-lg font-bold">首页</span>
      </div>
      
    </div>
    <div class="text-sm text-slate-300 mb-4">一个本地单页工具，帮你把“我想做的事”拆成可执行的总目标、里程碑与任务。</div>
    <div class="text-sm font-semibold mb-2">I wanna ...</div>
    <div class="flex gap-2">
      <input v-model="goal" @keyup.enter="start" class="flex-1 px-3 py-2 rounded border border-slate-700 bg-slate-900 text-slate-100" placeholder="请输入你想做的事（中文/英文）" />
      <button class="px-3 py-2 text-sm border border-slate-700 rounded hover:border-primary" @click="start">开始</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goal = ref('')

function start() {
  const base = (goal.value || '').trim()
  if (!base) return
  router.push({ path:'/chat', query:{ goal: base } })
}
</script>

<style scoped>
</style>
