import { vi } from 'vitest'

window.requestAnimationFrame = window.requestAnimationFrame || ((cb) => setTimeout(cb, 0))

vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({ matches: false, media: query, onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() })))

vi.mock('vue-router', () => {
  const replace = vi.fn()
  const push = vi.fn()
  const useRoute = () => ({ path: '/', query: {} })
  const useRouter = () => ({ replace, push })
  return { useRoute, useRouter }
})
