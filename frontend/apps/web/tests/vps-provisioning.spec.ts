import { test, expect } from './fixtures';
import { waitForToast, generateTestEmail, generateTestHostname, TEST_SSH_KEY } from './utils';

test.describe('User Authentication Flow', () => {
  test('should allow new user to sign up and reach verify-email', async ({ page }) => {
    const email = generateTestEmail('signup');
    const password = 'TestPassword123!';

    await page.goto('/signup');
    await page.fill('input[type="email"]', email);
    await page.locator('input[type="password"]').nth(0).fill(password);
    await page.locator('input[type="password"]').nth(1).fill(password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/verify-email/);
    await expect(page.locator('text=Verify your email')).toBeVisible();
  });

  test('should allow existing user to log in', async ({ authenticatedPage }) => {
    await expect(authenticatedPage).toHaveURL(/\/dashboard/);
    await expect(authenticatedPage.locator('text=Dashboard')).toBeVisible();
  });

  test('should allow user to log out', async ({ authenticatedPage }) => {
    await authenticatedPage.click('[data-testid="user-menu"], button:has-text("Account")');
    await authenticatedPage.click('button:has-text("Sign out"), a:has-text("Sign out")');
    await expect(authenticatedPage).toHaveURL('/');
  });
});

test.describe('VPS Instance Provisioning', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard');
    await expect(authenticatedPage.locator('text=Dashboard')).toBeVisible();
  });

  test('should display available plans on pricing page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/pricing');
    await expect(authenticatedPage.locator('[data-testid="plan-card"], .plan-card').first()).toBeVisible();
  });

  test('should create a new VPS instance', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/instances/create');
    
    await expect(authenticatedPage.locator('select[name="plan"]')).toBeVisible();
    await expect(authenticatedPage.locator('input[name="hostname"]')).toBeVisible();
    
    const hostname = generateTestHostname();
    await authenticatedPage.selectOption('select[name="plan"]', { index: 1 });
    await authenticatedPage.fill('input[name="hostname"]', hostname);
    
    await authenticatedPage.click('button[type="submit"]');
    
    await expect(authenticatedPage).toHaveURL(/\/dashboard\/instances\/[^/]+$/);
    await waitForToast(authenticatedPage, 'Instance created');
  });

  test('should show instance in dashboard after creation', async ({ authenticatedPage }) => {
    const hostname = generateTestHostname();
    
    await authenticatedPage.goto('/dashboard/instances/create');
    await authenticatedPage.selectOption('select[name="plan"]', { index: 1 });
    await authenticatedPage.fill('input[name="hostname"]', hostname);
    await authenticatedPage.click('button[type="submit"]');
    
    await expect(authenticatedPage).toHaveURL(/\/dashboard\/instances\/[^/]+$/);
    const instanceId = authenticatedPage.url().split('/').pop() || '';
    
    await authenticatedPage.goto('/dashboard/instances');
    await expect(authenticatedPage.locator(`text=${hostname}`)).toBeVisible({ timeout: 10000 });
  });

  test('should add SSH key and use it for instance creation', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/ssh-keys');
    await authenticatedPage.click('[data-testid="add-ssh-key"], button:has-text("Add SSH Key")');
    await authenticatedPage.fill('input[name="name"]', 'Test Key');
    await authenticatedPage.fill('textarea[name="publicKey"]', TEST_SSH_KEY);
    await authenticatedPage.click('button[type="submit"]');
    await waitForToast(authenticatedPage, 'SSH key added');
    
    await authenticatedPage.goto('/dashboard/instances/create');
    const hostname = generateTestHostname();
    await authenticatedPage.selectOption('select[name="plan"]', { index: 1 });
    await authenticatedPage.fill('input[name="hostname"]', hostname);
    await authenticatedPage.selectOption('select[name="sshKeyId"]', { label: 'Test Key' });
    await authenticatedPage.click('button[type="submit"]');
    
    await waitForToast(authenticatedPage, 'Instance created');
  });
});

test.describe('Instance Management', () => {
  let instanceId: string;
  let instanceHostname: string;

  test.beforeEach(async ({ authenticatedPage }) => {
    instanceHostname = generateTestHostname();
    await authenticatedPage.goto('/dashboard/instances/create');
    await authenticatedPage.selectOption('select[name="plan"]', { index: 1 });
    await authenticatedPage.fill('input[name="hostname"]', instanceHostname);
    await authenticatedPage.click('button[type="submit"]');
    await waitForToast(authenticatedPage, 'Instance created');
    
    instanceId = authenticatedPage.url().split('/').pop() || '';
  });

  test('should display instance details page', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`/dashboard/instances/${instanceId}`);
    await expect(authenticatedPage.locator(`text=${instanceHostname}`)).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="instance-status"], .status-badge')).toBeVisible();
  });

  test('should show instance console access', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`/dashboard/instances/${instanceId}`);
    await authenticatedPage.click('button:has-text("Console"), [data-testid="open-console"]');
    await expect(authenticatedPage.locator('[data-testid="terminal"], .terminal')).toBeVisible({ timeout: 10000 });
  });

  test('should allow instance power operations', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`/dashboard/instances/${instanceId}`);
    
    await authenticatedPage.click('button:has-text("Stop")');
    await authenticatedPage.click('button:has-text("Confirm")');
    await waitForToast(authenticatedPage, 'Instance stopped');
    
    await authenticatedPage.click('button:has-text("Start")');
    await waitForToast(authenticatedPage, 'Instance started');
  });

  test('should show instance metrics', async ({ authenticatedPage }) => {
    await authenticatedPage.goto(`/dashboard/instances/${instanceId}`);
    await authenticatedPage.click('a:has-text("Metrics"), [data-testid="metrics-tab"]');
    await expect(authenticatedPage.locator('[data-testid="cpu-chart"], .metric-chart').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Billing and Subscriptions', () => {
  test('should display billing overview', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing');
    await expect(authenticatedPage.locator('text=Billing')).toBeVisible();
  });

  test('should show payment methods', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing/payment-methods');
    await expect(authenticatedPage.locator('text=Payment Methods')).toBeVisible();
  });

  test('should display invoices', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/billing/invoices');
    await expect(authenticatedPage.locator('text=Invoices')).toBeVisible();
  });
});

test.describe('Support and Tickets', () => {
  test('should allow creating a support ticket', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/support');
    await authenticatedPage.click('button:has-text("Create Ticket")');
    await authenticatedPage.selectOption('select[name="category"]', 'technical');
    await authenticatedPage.fill('input[name="subject"]', 'Test ticket from Playwright');
    await authenticatedPage.fill('textarea[name="body"]', 'This is a test ticket created during automated testing.');
    await authenticatedPage.click('button[type="submit"]');
    await waitForToast(authenticatedPage, 'Ticket created');
  });
});

test.describe('API Keys', () => {
  test('should allow creating an API key', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/api-keys');
    await authenticatedPage.click('button:has-text("Create API Key")');
    await authenticatedPage.fill('input[name="name"]', 'Test API Key');
    await authenticatedPage.click('button[type="submit"]');
    
    const keyDialog = authenticatedPage.locator('[data-testid="api-key-dialog"], .api-key-dialog');
    await expect(keyDialog).toBeVisible();
    await expect(keyDialog.locator('text=Key created successfully')).toBeVisible();
  });
});