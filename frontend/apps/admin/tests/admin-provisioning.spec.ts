import { test, expect } from './fixtures';
import { waitForToast, navigateToAdminSection, createPlan, createNode } from './utils';

test.describe('Admin Dashboard', () => {
  test('should load admin dashboard', async ({ adminPage }) => {
    await expect(adminPage.locator('text=Dashboard')).toBeVisible();
    await expect(adminPage.locator('[data-testid="stats-cards"], .stats-grid')).toBeVisible();
  });

  test('should display system health metrics', async ({ adminPage }) => {
    await expect(adminPage.locator('text=System Health, text=Nodes, text=Instances')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Plan Management', () => {
  test('should list all plans', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'plans');
    await expect(adminPage.locator('text=Plans')).toBeVisible();
    await expect(adminPage.locator('[data-testid="plan-row"], .plan-row').first()).toBeVisible({ timeout: 10000 });
  });

  test('should create a new plan', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'plans');
    const planSlug = `test-plan-${Date.now()}`;
    
    await adminPage.click('button:has-text("Create Plan")');
    await adminPage.fill('input[name="name"]', 'Test Plan');
    await adminPage.fill('input[name="slug"]', planSlug);
    await adminPage.fill('input[name="cpu"]', '2');
    await adminPage.fill('input[name="ramMb"]', '4096');
    await adminPage.fill('input[name="storageGb"]', '50');
    await adminPage.fill('input[name="priceNgn"]', '5000');
    await adminPage.click('button[type="submit"]');
    
    await waitForToast(adminPage, 'Plan created');
    await expect(adminPage.locator(`text=${planSlug}`)).toBeVisible();
  });

  test('should edit existing plan', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'plans');
    await adminPage.locator('[data-testid="edit-plan"], button:has-text("Edit")').first().click();
    await adminPage.fill('input[name="priceNgn"]', '6000');
    await adminPage.click('button[type="submit"]');
    await waitForToast(adminPage, 'Plan updated');
  });

  test('should disable a plan', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'plans');
    await adminPage.locator('[data-testid="disable-plan"], button:has-text("Disable")').first().click();
    await adminPage.click('button:has-text("Confirm")');
    await waitForToast(adminPage, 'Plan disabled');
  });
});

test.describe('Node Management', () => {
  test('should list all nodes', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'nodes');
    await expect(adminPage.locator('text=Nodes')).toBeVisible();
    await expect(adminPage.locator('[data-testid="node-row"], .node-row').first()).toBeVisible({ timeout: 10000 });
  });

  test('should register a new node', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'nodes');
    const nodeName = `test-node-${Date.now()}`;
    
    await adminPage.click('button:has-text("Add Node")');
    await adminPage.fill('input[name="name"]', nodeName);
    await adminPage.fill('input[name="provider"]', 'digitalocean');
    await adminPage.fill('input[name="region"]', 'nyc1');
    await adminPage.fill('input[name="totalCpu"]', '16');
    await adminPage.fill('input[name="totalRamMb"]', '32768');
    await adminPage.fill('input[name="totalStorageGb"]', '500');
    await adminPage.click('button[type="submit"]');
    
    await waitForToast(adminPage, 'Node created');
    await expect(adminPage.locator(`text=${nodeName}`)).toBeVisible();
  });

  test('should show node details and metrics', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'nodes');
    await adminPage.locator('[data-testid="view-node"], a[href*="/nodes/"]').first().click();
    await expect(adminPage.locator('[data-testid="node-details"], .node-details')).toBeVisible();
    await expect(adminPage.locator('text=CPU, text=RAM, text=Storage')).toBeVisible();
  });

  test('should put node in maintenance mode', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'nodes');
    await adminPage.locator('[data-testid="maintenance-node"], button:has-text("Maintenance")').first().click();
    await adminPage.click('button:has-text("Confirm")');
    await waitForToast(adminPage, 'Node set to maintenance');
  });

  test('should drain node', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'nodes');
    await adminPage.locator('[data-testid="drain-node"], button:has-text("Drain")').first().click();
    await adminPage.click('button:has-text("Confirm")');
    await waitForToast(adminPage, 'Node draining');
  });
});

test.describe('Instance Management (Admin)', () => {
  test('should list all customer instances', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'instances');
    await expect(adminPage.locator('text=Instances')).toBeVisible();
    await expect(adminPage.locator('[data-testid="instance-row"], .instance-row').first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter instances by status', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'instances');
    await adminPage.selectOption('select[name="status"]', 'RUNNING');
    await adminPage.click('button:has-text("Filter")');
    await expect(adminPage.locator('[data-testid="instance-row"], .instance-row').first()).toHaveAttribute('data-status', 'RUNNING');
  });

  test('should view instance details', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'instances');
    await adminPage.locator('[data-testid="view-instance"], a[href*="/instances/"]').first().click();
    await expect(adminPage.locator('[data-testid="instance-details"], .instance-details')).toBeVisible();
  });

  test('should suspend instance', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'instances');
    const instanceRow = adminPage.locator('[data-testid="instance-row"], .instance-row').first();
    const instanceId = await instanceRow.getAttribute('data-id');
    
    await instanceRow.locator('button:has-text("Suspend"), [data-testid="suspend-instance"]').click();
    await adminPage.click('button:has-text("Confirm")');
    await waitForToast(adminPage, 'Instance suspended');
  });

  test('should terminate instance', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'instances');
    const instanceRow = adminPage.locator('[data-testid="instance-row"], .instance-row').first();
    
    await instanceRow.locator('button:has-text("Terminate"), [data-testid="terminate-instance"]').click();
    await adminPage.fill('input[name="confirmation"]', 'TERMINATE');
    await adminPage.click('button:has-text("Confirm Termination")');
    await waitForToast(adminPage, 'Instance terminated');
  });
});

test.describe('Customer Management', () => {
  test('should list all customers', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'customers');
    await expect(adminPage.locator('text=Customers')).toBeVisible();
    await expect(adminPage.locator('[data-testid="customer-row"], .customer-row').first()).toBeVisible({ timeout: 10000 });
  });

  test('should view customer details', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'customers');
    await adminPage.locator('[data-testid="view-customer"], a[href*="/customers/"]').first().click();
    await expect(adminPage.locator('[data-testid="customer-details"], .customer-details')).toBeVisible();
  });

  test('should suspend customer account', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'customers');
    const customerRow = adminPage.locator('[data-testid="customer-row"], .customer-row').first();
    
    await customerRow.locator('button:has-text("Suspend"), [data-testid="suspend-customer"]').click();
    await adminPage.click('button:has-text("Confirm")');
    await waitForToast(adminPage, 'Customer suspended');
  });
});

test.describe('Billing Management', () => {
  test('should display payments overview', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'payments');
    await expect(adminPage.locator('text=Payments')).toBeVisible();
  });

  test('should display transactions', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'transactions');
    await expect(adminPage.locator('text=Transactions')).toBeVisible();
  });

  test('should display invoices', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'invoices');
    await expect(adminPage.locator('text=Invoices')).toBeVisible();
  });
});

test.describe('Audit Logs', () => {
  test('should display audit logs', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'audit-logs');
    await expect(adminPage.locator('text=Audit Logs')).toBeVisible();
    await expect(adminPage.locator('[data-testid="audit-log-row"], .audit-log-row').first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter audit logs', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'audit-logs');
    await adminPage.fill('input[name="action"]', 'instance.create');
    await adminPage.click('button:has-text("Filter")');
    await expect(adminPage.locator('[data-testid="audit-log-row"], .audit-log-row').first()).toBeVisible();
  });
});

test.describe('Incidents', () => {
  test('should display incidents page', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'incidents');
    await expect(adminPage.locator('text=Incidents')).toBeVisible();
  });

  test('should create a new incident', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'incidents');
    await adminPage.click('button:has-text("Create Incident")');
    await adminPage.fill('input[name="title"]', 'Test Incident');
    await adminPage.fill('input[name="component"]', 'API');
    await adminPage.fill('textarea[name="message"]', 'This is a test incident created during automated testing.');
    await adminPage.click('button[type="submit"]');
    await waitForToast(adminPage, 'Incident created');
  });
});

test.describe('Abuse Management', () => {
  test('should display abuse cases', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'abuse');
    await expect(adminPage.locator('text=Abuse Cases')).toBeVisible();
  });

  test('should resolve abuse case', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'abuse');
    await adminPage.locator('[data-testid="resolve-abuse"], button:has-text("Resolve")').first().click();
    await adminPage.fill('textarea[name="resolution"]', 'Resolved via automated test');
    await adminPage.click('button[type="submit"]');
    await waitForToast(adminPage, 'Abuse case resolved');
  });
});

test.describe('System Settings', () => {
  test('should display settings page', async ({ adminPage }) => {
    await navigateToAdminSection(adminPage, 'settings');
    await expect(adminPage.locator('text=Settings')).toBeVisible();
  });
});