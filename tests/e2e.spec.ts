import { test, expect } from '@playwright/test';

test('Eligibility Flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Start Guide');

  await page.fill('input[name="age"]', '20');
  await page.click('text=Next');

  // Using a loose locator because we don't exactly know what the UI says yet, 
  // but based on prompt this is the check:
  await expect(page.locator('text=eligible')).toBeVisible();
});

test('Invalid Input Recovery', async ({ page }) => {
  await page.goto('/');
  // Assuming "age" validation fails for 'abc'
  await page.fill('input[name="age"]', 'abc');
  await page.click('text=Next');

  await expect(page.locator('text=invalid')).toBeVisible();
});

test('Gemini FAQ fallback (mocked)', async ({ page }) => {
  // Mock the /api/chat route
  await page.route('**/api/chat', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        sessionId: 'test-session',
        reply: 'Mock Gemini Response',
        options: [],
        state: 'start',
        timeline: []
      })
    })
  );

  await page.goto('/');
  
  // This assumes an input field for chat and a send button
  // I will use a generic selector for input and send based on the prompt
  // In the current frontend code `input` might be `#chat-input` and 'text=Send' might be a button.
  // I'll adjust the selectors based on the prompt's provided snippet.
  await page.fill('input', 'What is voting?');
  await page.click('text=Send');

  await expect(page.locator('text=Mock Gemini Response')).toBeVisible();
});
