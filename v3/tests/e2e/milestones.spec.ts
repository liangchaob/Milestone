import { test, expect } from '@playwright/test'

test.describe('Milestones page E2E', () => {
  test('page accessible and interactive', async ({ page }) => {
    await page.goto('http://localhost:5173/chat')
    await page.goto('http://localhost:5173/app')
    await expect(page.locator('.sidebar')).toBeVisible()
    await expect(page.locator('.sidebar')).toBeVisible()
    const items = page.locator('.milestone-item')
    await expect(items.first()).toBeVisible()
  })
})
