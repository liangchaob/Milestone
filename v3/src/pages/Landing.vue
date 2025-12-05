<template>
  <div class="card">
    <div class="hero-title mb-2">更聪明的项目规划</div>
    <div class="hero-sub mb-4">把目标拆成总目标、里程碑与任务，跨设备自适应。</div>
    <div class="mb-2" style="font-size:12px;font-weight:600">I wanna ...</div>
    <div style="display:flex;gap:8px">
      <input v-model="goal" @keyup.enter="start" class="input" placeholder="请输入你想做的事（中文/英文）" style="flex:1" />
      <button class="btn btn-primary" @click="start">开始</button>
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
