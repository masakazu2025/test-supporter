import { test, expect } from '@playwright/test'

test('ページが表示される', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Test Supporter/)
})
