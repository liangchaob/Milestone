<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="md:col-span-1 bg-slate-800 border border-slate-700 rounded-lg p-3">
      <div class="text-sm font-semibold mb-2">里程碑</div>
      <div class="space-y-2">
        <div v-for="m in milestones" :key="m.id" class="p-2 rounded border border-slate-700 hover:border-primary/50 hover:shadow-[0_0_12px_var(--glow)] cursor-pointer" @click="select(m.id)">
          <div class="text-sm font-semibold">{{ m.title }}</div>
          <div class="text-xs text-slate-400">{{ m.desc }}</div>
        </div>
      </div>
      <div class="mt-3 flex gap-2">
        <button class="px-2 py-1 text-xs border border-slate-700 rounded hover:border-primary hover:shadow-[0_0_12px_var(--glow)]" @click="addMilestone">新建里程碑</button>
        <button class="px-2 py-1 text-xs border border-slate-700 rounded hover:border-primary hover:shadow-[0_0_12px_var(--glow)]" @click="reload">刷新</button>
      </div>
    </div>
    <div class="md:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-3">
      <div class="text-sm font-semibold mb-2">详情</div>
      <div v-if="currentMilestone">
        <div class="text-base font-bold">{{ currentMilestone.title }}</div>
        <div class="text-xs text-slate-400 mb-2">{{ currentMilestone.desc }}</div>
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs text-slate-400">任务</div>
          <button class="px-2 py-1 text-xs border border-slate-700 rounded hover:border-primary hover:shadow-[0_0_12px_var(--glow)]" @click="addTask">新建任务</button>
        </div>
        <div class="space-y-2">
          <div v-for="t in tasks" :key="t.id" class="p-2 rounded border border-slate-700 flex items-start gap-2">
            <input type="checkbox" :checked="t.done" @change="toggleTask(t)" class="mt-1 w-4 h-4 accent-primary" />
            <div class="flex-1">
              <div class="text-sm" :class="t.done ? 'line-through text-slate-300' : ''">{{ t.text }}</div>
              <div v-if="t.desc" class="text-xs text-slate-400">{{ t.desc }}</div>
            </div>
            <button class="px-2 py-1 text-xs border border-slate-700 rounded hover:border-primary" @click="removeTask(t.id)">删除</button>
          </div>
        </div>
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

const currentMilestone = computed(() => milestones.value.find(x => x.id === currentId.value))

async function reload() {
  await DB.init()
  milestones.value = DB.listMilestones()
  if (!currentId.value && milestones.value.length) currentId.value = milestones.value[0].id
  await loadTasks()
}

async function loadTasks() {
  if (!currentId.value) { tasks.value = []; return }
  tasks.value = DB.listTasks(currentId.value)
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
}

async function toggleTask(t) {
  DB.updateTask({ ...t, done: !t.done })
  await loadTasks()
}

async function removeTask(id) {
  DB.deleteTask(id)
  await loadTasks()
}

onMounted(reload)
</script>

<style scoped>
</style>
