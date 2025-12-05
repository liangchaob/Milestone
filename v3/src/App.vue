<template>
  <div class="min-h-screen grid-bg">
    <div class="nav" v-if="route.path !== '/app'">
      <div class="brand">
        <span class="brand-icon">🔸</span>
        <span class="brand-name">Milestone</span>
      </div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/chat">对话</router-link>
        <router-link to="/app">里程碑</router-link>
      </div>
    </div>
    <div :class="route.path === '/app' ? 'page-full' : 'container'">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
</style>
