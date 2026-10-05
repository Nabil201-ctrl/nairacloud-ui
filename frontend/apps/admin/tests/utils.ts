import { Page, expect } from '@playwright/test';

export async function waitForToast(page: Page, message: string, timeout = 5000) {
  const toast = page.locator('[role="status"], [role="alert"], .toast, .sonner-toast').filter({ hasText: message });
  await expect(toast).toBeVisible({ timeout });
}

export async function navigateToAdminSection(page: Page, section: string) {
  await page.click(`[data-testid="nav-${section}"], a[href*="${section}"]`);
  await page.waitForLoadState('networkidle');
}

export async function createPlan(page: Page, plan: {
  name: string;
  slug: string;
  cpu: number;
  ramMb: number;
  storageGb: number;
  priceNgn: number;
}) {
  await navigateToAdminSection(page, 'plans');
  await page.click('button:has-text("Create Plan")');
  await page.fill('input[name="name"]', plan.name);
  await page.fill('input[name="slug"]', plan.slug);
  await page.fill('input[name="cpu"]', plan.cpu.toString());
  await page.fill('input[name="ramMb"]', plan.ramMb.toString());
  await page.fill('input[name="storageGb"]', plan.storageGb.toString());
  await page.fill('input[name="priceNgn"]', plan.priceNgn.toString());
  await page.click('button[type="submit"]');
  await waitForToast(page, 'Plan created');
}

export async function createNode(page: Page, node: {
  name: string;
  provider: string;
  region: string;
  totalCpu: number;
  totalRamMb: number;
  totalStorageGb: number;
}) {
  await navigateToAdminSection(page, 'nodes');
  await page.click('button:has-text("Add Node")');
  await page.fill('input[name="name"]', node.name);
  await page.fill('input[name="provider"]', node.provider);
  await page.fill('input[name="region"]', node.region);
  await page.fill('input[name="totalCpu"]', node.totalCpu.toString());
  await page.fill('input[name="totalRamMb"]', node.totalRamMb.toString());
  await page.fill('input[name="totalStorageGb"]', node.totalStorageGb.toString());
  await page.click('button[type="submit"]');
  await waitForToast(page, 'Node created');
}

export async function suspendInstance(page: Page, instanceId: string) {
  await page.goto(`/dashboard/instances/${instanceId}`);
  await page.click('button:has-text("Suspend")');
  await page.click('button:has-text("Confirm")');
  await waitForToast(page, 'Instance suspended');
}

export async function terminateInstance(page: Page, instanceId: string) {
  await page.goto(`/dashboard/instances/${instanceId}`);
  await page.click('button:has-text("Terminate")');
  await page.fill('input[name="confirmation"]', 'TERMINATE');
  await page.click('button:has-text("Confirm Termination")');
  await waitForToast(page, 'Instance terminated');
}

export async function viewAuditLogs(page: Page, filters?: { userId?: string; action?: string; resource?: string }) {
  await navigateToAdminSection(page, 'audit-logs');
  if (filters?.userId) {
    await page.fill('input[name="userId"]', filters.userId);
  }
  if (filters?.action) {
    await page.fill('input[name="action"]', filters.action);
  }
  if (filters?.resource) {
    await page.fill('input[name="resource"]', filters.resource);
  }
  if (filters) {
    await page.click('button:has-text("Filter")');
  }
  await page.waitForLoadState('networkidle');
}