import { test, expect } from '@playwright/test'

test.describe('JSON redirect on SSE', () => {
  test('redirects to /app when valid JSON starts with {', async ({ page }) => {
    await page.route('**/api/chat/stream', async (route) => {
      const body = 'data: {"content":"  {\\"milestones\\":[]}"}\n\n' + 'data: [DONE]\n\n'
      await route.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream' }, body })
    })
    await page.goto('/chat?goal=auto')
    await page.waitForURL('**/app*', { timeout: 8000 })
    await expect(page.locator('.sidebar')).toBeVisible()
  })

  test('stays on /chat for non-JSON content', async ({ page }) => {
    await page.route('**/api/chat/stream', async (route) => {
      const body = 'data: {"content":"Hello world"}\n\n' + 'data: [DONE]\n\n'
      await route.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream' }, body })
    })
    await page.goto('/chat?goal=hello')
    await page.waitForTimeout(400)
    expect(page.url()).toContain('/chat')
  })

  test('shows retry then redesign on invalid JSON', async ({ page }) => {
    await page.route('**/api/chat/stream', async (route) => {
      const body = 'data: {"content":" { invalid } "}\n\n' + 'data: [DONE]\n\n'
      await route.fulfill({ status: 200, headers: { 'Content-Type': 'text/event-stream' }, body })
    })
    await page.goto('/chat?goal=x')
    await expect(page.locator('text=计划生成失败')).toBeVisible({ timeout: 6000 })
    await expect(page.locator('text=重新设计')).toBeVisible({ timeout: 6000 })
    expect(page.url()).toContain('/chat')
  })
})
