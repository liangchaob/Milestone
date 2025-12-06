<template>
  <div class="w-screen h-screen grid-bg">
    <div :class="(route.path === '/chat' || route.path === '/app') ? 'page-full' : 'container'">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { onMounted, onBeforeUnmount } from 'vue'
const route = useRoute()

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
</script>

<style scoped>
</style>
