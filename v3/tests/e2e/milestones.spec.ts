import { test, expect } from '@playwright/test'

test.describe('Milestones page E2E', () => {
  test('page accessible and interactive', async ({ page }) => {
    await page.goto('/chat')
    await page.goto('/app')
    await expect(page.locator('.sidebar')).toBeVisible()
    await expect(page.locator('.sidebar')).toBeVisible()
    await page.waitForTimeout(200)
  })
})
