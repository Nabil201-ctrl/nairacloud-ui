import { test as base, type Page } from '@playwright/test';

interface AdminTestFixtures {
  adminPage: Page;
  adminCredentials: {
    email: string;
    password: string;
  };
}

export const test = base.extend<AdminTestFixtures>({
  adminCredentials: async ({}, use) => {
    const credentials = {
      email: process.env.ADMIN_EMAIL || 'admin@nairacloud.test',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
    };
    await use(credentials);
  },

  adminPage: async ({ page, adminCredentials }, use) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', adminCredentials.email);
    await page.fill('input[name="password"]', adminCredentials.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard**');
    
    await use(page);
  },
});

export { expect } from '@playwright/test';