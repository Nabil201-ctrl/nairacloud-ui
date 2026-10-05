import { test as base, type Page } from '@playwright/test';
import { randomUUID } from 'crypto';

interface TestFixtures {
  authenticatedPage: Page;
  testUser: {
    email: string;
    password: string;
  };
}

export const test = base.extend<TestFixtures>({
  testUser: async ({}, use) => {
    const user = {
      email: `test-${randomUUID()}@nairacloud.test`,
      password: 'TestPassword123!',
    };
    await use(user);
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    await page.goto('/auth/signup');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard**');
    
    await use(page);
  },
});

export { expect } from '@playwright/test';