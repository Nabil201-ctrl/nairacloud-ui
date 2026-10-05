import { Page, Locator, expect } from '@playwright/test';

export async function waitForToast(page: Page, message: string, timeout = 5000) {
  const toast = page.locator('[role="status"], [role="alert"], .toast, .sonner-toast').filter({ hasText: message });
  await expect(toast).toBeVisible({ timeout });
}

export async function fillForm(page: Page, fields: Record<string, string>) {
  for (const [name, value] of Object.entries(fields)) {
    const input = page.locator(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`);
    await input.fill(value);
  }
}

export async function clickAndWaitForNavigation(page: Page, selector: string, waitUntil: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle') {
  await Promise.all([
    page.waitForLoadState(waitUntil),
    page.click(selector),
  ]);
}

export async function selectPlan(page: Page, planSlug: string) {
  const planCard = page.locator(`[data-plan="${planSlug}"], [data-testid="plan-${planSlug}"]`);
  await planCard.click();
  await page.waitForURL(/.*plan.*/);
}

export async function createInstance(page: Page, options: {
  plan: string;
  hostname: string;
  sshKeyName?: string;
  region?: string;
}) {
  await page.goto('/dashboard/instances/create');
  await page.selectOption('select[name="plan"]', options.plan);
  await page.fill('input[name="hostname"]', options.hostname);
  
  if (options.sshKeyName) {
    await page.selectOption('select[name="sshKeyId"]', { label: options.sshKeyName });
  }
  
  if (options.region) {
    await page.selectOption('select[name="region"]', options.region);
  }
  
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard\/instances\/[^/]+$/);
}

export async function waitForInstanceStatus(page: Page, instanceId: string, expectedStatus: string, timeout = 300000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    await page.goto(`/dashboard/instances/${instanceId}`);
    const statusBadge = page.locator('[data-testid="instance-status"], .status-badge').first();
    const status = await statusBadge.textContent();
    if (status?.includes(expectedStatus)) {
      return;
    }
    await page.waitForTimeout(5000);
  }
  throw new Error(`Instance ${instanceId} did not reach status ${expectedStatus} within ${timeout}ms`);
}

export async function addSshKey(page: Page, name: string, publicKey: string) {
  await page.goto('/dashboard/ssh-keys');
  await page.click('[data-testid="add-ssh-key"], button:has-text("Add SSH Key")');
  await page.fill('input[name="name"]', name);
  await page.fill('textarea[name="publicKey"]', publicKey);
  await page.click('button[type="submit"]');
  await waitForToast(page, 'SSH key added');
}

export const TEST_SSH_KEY = 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQTestKeyForTesting== test@nairacloud';

export function generateTestEmail(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@nairacloud.test`;
}

export function generateTestHostname(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}