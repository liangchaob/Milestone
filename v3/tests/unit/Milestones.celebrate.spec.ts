import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import Milestones from '../../src/pages/Milestones.vue'

describe('Milestones.vue celebrate overlay', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(async () => {
    wrapper = mount(Milestones)
    await new Promise(r => setTimeout(r, 0))
  })

  it('shows toast and closes on container animationend', async () => {
    const btn = wrapper.find('button[title="庆祝"]')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')
    await wrapper.vm.$nextTick()

    const toast = wrapper.find('.celebrate-toast')
    expect(toast.exists()).toBe(true)
    const inner = wrapper.find('.celebrate-inner')
    expect(inner.exists()).toBe(true)
    expect(inner.element.style.animation).toContain('textFade')

    inner.element.dispatchEvent(new Event('animationend'))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.celebrate-toast').exists()).toBe(false)
    const canvas = wrapper.find('.confetti-canvas')
    expect(canvas.exists()).toBe(true)
    // v-show toggles display to none
    expect((canvas.element as HTMLCanvasElement).style.display).toBe('none')
  })

  it('closes when text element emits animationend', async () => {
    const btn = wrapper.find('button[title="庆祝"]')
    await btn.trigger('click')
    await wrapper.vm.$nextTick()

    const textEl = wrapper.find('.celebrate-text')
    expect(textEl.exists()).toBe(true)
    textEl.element.dispatchEvent(new Event('animationend'))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.celebrate-toast').exists()).toBe(false)
  })
})

