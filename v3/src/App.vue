<template>
  <div class="min-h-screen p-4">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <span class="inline-flex w-4 h-4 text-primary">🔸</span>
        <span class="text-lg font-bold">Milestone v3</span>
      </div>
      <div class="flex items-center gap-2 text-xs text-slate-400">
        <router-link to="/" class="underline">首页</router-link>
        <router-link to="/chat" class="underline">对话</router-link>
        <router-link to="/app" class="underline">里程碑</router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
</style>
