import { createRouter, createWebHistory } from 'vue-router'
import Landing from './pages/Landing.vue'
import Chat from './pages/Chat.vue'
import Milestones from './pages/Milestones.vue'
import SelfTest from './pages/SelfTest.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Landing },
    { path: '/chat', component: Chat },
    { path: '/app', component: Milestones },
    { path: '/selftest', component: SelfTest }
  ]
})
