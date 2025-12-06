<template>
  <div class="w-screen h-screen grid-bg">
    <div v-if="route.path === '/'" class="site-header">
      <div class="container header-inner">
        <div class="header-left">
          <div class="logo-mark">🔸</div>
          <div class="logo-text">Milestone</div>
        </div>
        <button class="login-btn" @click="goLogin" title="登录">
          <svg class="login-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v2h16v-2c0-2.761-3.582-5-8-5z"/>
          </svg>
        </button>
      </div>
    </div>
    <div :class="(route.path === '/chat' || route.path === '/app') ? 'page-full' : 'container'">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, onBeforeUnmount } from 'vue'
const route = useRoute()
const router = useRouter()

function updateVH() {
  const vh = (window.visualViewport ? window.visualViewport.height : window.innerHeight) * 0.01
  document.documentElement.style.setProperty('--vh', vh + 'px')
}

onMounted(() => {
  updateVH()
  window.addEventListener('resize', updateVH)
  if (window.visualViewport) window.visualViewport.addEventListener('resize', updateVH)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateVH)
  if (window.visualViewport) window.visualViewport.removeEventListener('resize', updateVH)
})

function goLogin() {
  router.push('/app')
}
</script>

<style scoped>
</style>
