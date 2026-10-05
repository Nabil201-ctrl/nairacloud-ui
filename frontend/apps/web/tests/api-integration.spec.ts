import { test, expect, type Page } from '@playwright/test';
import { generateTestEmail, generateTestHostname, TEST_SSH_KEY } from './utils';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const API_URL = process.env.API_URL || 'http://localhost:4000';

interface TestUser {
  email: string;
  password: string;
  token?: string;
  userId?: string;
  sshKeyId?: string;
  instanceId?: string;
}

let testUser: TestUser;

async function signupUser(page: Page, user: TestUser) {
  const response = await page.request.post(`${API_URL}/auth/signup`, {
    data: {
      email: user.email,
      password: user.password,
      name: 'Test User',
    },
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  user.token = data.accessToken;
  user.userId = data.user.id;
}

async function loginUser(page: Page, user: TestUser) {
  const response = await page.request.post(`${API_URL}/auth/login`, {
    data: {
      email: user.email,
      password: user.password,
    },
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  user.token = data.accessToken;
}

async function createInstanceViaAPI(page: Page, user: TestUser, instance: { planId: string; hostname: string; sshKeyId: string }) {
  const response = await page.request.post(`${API_URL}/instances`, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
    data: instance,
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

test.describe('Complete VPS Provisioning Flow (API + UI)', () => {
  test.beforeAll(async ({ request }) => {
    testUser = {
      email: generateTestEmail('e2e'),
      password: 'TestPassword123!',
    };
    
    const response = await request.post(`${API_URL}/auth/signup`, {
      data: {
        email: testUser.email,
        password: testUser.password,
        name: 'E2E Test User',
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    testUser.token = data.accessToken;
    testUser.userId = data.user.id;
  });

  test('should fetch available plans via API', async ({ request }) => {
    const response = await request.get(`${API_URL}/plans`, {
      headers: {
        Authorization: `Bearer ${testUser.token}`,
      },
    });
    expect(response.ok()).toBeTruthy();
    const plans = await response.json();
    expect(Array.isArray(plans)).toBeTruthy();
    expect(plans.length).toBeGreaterThan(0);
  });

  test('should create SSH key via API', async ({ request }) => {
    const response = await request.post(`${API_URL}/ssh-keys`, {
      headers: {
        Authorization: `Bearer ${testUser.token}`,
      },
      data: {
        name: 'E2E Test Key',
        publicKey: TEST_SSH_KEY,
      },
    });
    expect(response.ok()).toBeTruthy();
    const key = await response.json();
    expect(key.id).toBeDefined();
    testUser.sshKeyId = key.id;
  });

  test('should provision VPS instance via API', async ({ request }) => {
    const plansResponse = await request.get(`${API_URL}/plans`, {
      headers: { Authorization: `Bearer ${testUser.token}` },
    });
    const plans = await plansResponse.json();
    const plan = plans[0];

    const instanceResponse = await request.post(`${API_URL}/instances`, {
      headers: { Authorization: `Bearer ${testUser.token}` },
      data: {
        planId: plan.id,
        hostname: generateTestHostname(),
        sshKeyId: testUser.sshKeyId!,
      },
    });
    expect(instanceResponse.ok()).toBeTruthy();
    const instance = await instanceResponse.json();
    expect(instance.id).toBeDefined();
    expect(instance.status).toBe('CREATING');
    testUser.instanceId = instance.id;
  });

  test('should track instance provisioning status', async ({ request }) => {
    let status = 'CREATING';
    let attempts = 0;
    const maxAttempts = 60;

    while (status === 'CREATING' || status === 'WAITLISTED' || status === 'BOOTING') {
      if (attempts >= maxAttempts) {
        throw new Error('Instance provisioning timed out');
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const response = await request.get(`${API_URL}/instances/${testUser.instanceId}`, {
        headers: { Authorization: `Bearer ${testUser.token}` },
      });
      expect(response.ok()).toBeTruthy();
      const instance = await response.json();
      status = instance.status;
      attempts++;
    }

    expect(['RUNNING', 'ERROR', 'DEGRADED']).toContain(status);
  });

  test('should access instance console via WebSocket', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/instances/${testUser.instanceId}`);
    
    await page.evaluate((token) => {
      localStorage.setItem('auth_token', token);
    }, testUser.token!);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.click('button:has-text("Console"), [data-testid="open-console"]');
    await expect(page.locator('[data-testid="terminal"], .terminal')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Multi-User VPS Provisioning', () => {
  test('should handle concurrent instance creation', async ({ request }) => {
    const users: TestUser[] = [];
    const instancePromises: Promise<any>[] = [];

    for (let i = 0; i < 3; i++) {
      const user: TestUser = {
        email: generateTestEmail(`concurrent-${i}`),
        password: 'TestPassword123!',
      };
      users.push(user);

      const signupResponse = await request.post(`${API_URL}/auth/signup`, {
        data: { email: user.email, password: user.password, name: `User ${i}` },
      });
      expect(signupResponse.ok()).toBeTruthy();
      const signupData = await signupResponse.json();
      user.token = signupData.accessToken;
      user.userId = signupData.user.id;

      const keyResponse = await request.post(`${API_URL}/ssh-keys`, {
        headers: { Authorization: `Bearer ${user.token}` },
        data: { name: `Key ${i}`, publicKey: TEST_SSH_KEY },
      });
      expect(keyResponse.ok()).toBeTruthy();
      const key = await keyResponse.json();
      user.sshKeyId = key.id;
    }

    const plansResponse = await request.get(`${API_URL}/plans`, {
      headers: { Authorization: `Bearer ${users[0]!.token}` },
    });
    const plans = await plansResponse.json();
    const plan = plans[0];

    for (const user of users) {
      instancePromises.push(
        request.post(`${API_URL}/instances`, {
          headers: { Authorization: `Bearer ${user.token}` },
          data: {
            planId: plan.id,
            hostname: generateTestHostname(),
            sshKeyId: user.sshKeyId!,
          },
        })
      );
    }

    const results = await Promise.all(instancePromises);
    for (const result of results) {
      expect(result.ok()).toBeTruthy();
      const instance = await result.json();
      expect(instance.id).toBeDefined();
      expect(instance.status).toBe('CREATING');
    }
  });
});

test.describe('Instance Lifecycle Operations', () => {
  let lifecycleUser: TestUser;
  let instanceId: string;

  test.beforeAll(async ({ request }) => {
    lifecycleUser = {
      email: generateTestEmail('lifecycle'),
      password: 'TestPassword123!',
    };

    const response = await request.post(`${API_URL}/auth/signup`, {
      data: { email: lifecycleUser.email, password: lifecycleUser.password, name: 'Lifecycle User' },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    lifecycleUser.token = data.accessToken;
    lifecycleUser.userId = data.user.id;

    const keyResponse = await request.post(`${API_URL}/ssh-keys`, {
      headers: { Authorization: `Bearer ${lifecycleUser.token}` },
      data: { name: 'Lifecycle Key', publicKey: TEST_SSH_KEY },
    });
    expect(keyResponse.ok()).toBeTruthy();
    const key = await keyResponse.json();
    lifecycleUser.sshKeyId = key.id;

    const plansResponse = await request.get(`${API_URL}/plans`, {
      headers: { Authorization: `Bearer ${lifecycleUser.token}` },
    });
    const plans = await plansResponse.json();
    const plan = plans[0];

    const instanceResponse = await request.post(`${API_URL}/instances`, {
      headers: { Authorization: `Bearer ${lifecycleUser.token}` },
      data: {
        planId: plan.id,
        hostname: generateTestHostname(),
        sshKeyId: lifecycleUser.sshKeyId!,
      },
    });
    expect(instanceResponse.ok()).toBeTruthy();
    const instance = await instanceResponse.json();
    instanceId = instance.id;
    lifecycleUser.instanceId = instanceId;
  });

  test('should stop instance', async ({ request }) => {
    const response = await request.post(`${API_URL}/instances/${instanceId}/stop`, {
      headers: { Authorization: `Bearer ${lifecycleUser.token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should start instance', async ({ request }) => {
    const response = await request.post(`${API_URL}/instances/${instanceId}/start`, {
      headers: { Authorization: `Bearer ${lifecycleUser.token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should restart instance', async ({ request }) => {
    const response = await request.post(`${API_URL}/instances/${instanceId}/restart`, {
      headers: { Authorization: `Bearer ${lifecycleUser.token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should rebuild instance', async ({ request }) => {
    const response = await request.post(`${API_URL}/instances/${instanceId}/rebuild`, {
      headers: { Authorization: `Bearer ${lifecycleUser.token}` },
    });
    expect(response.ok()).toBeTruthy();
  });

  test('should terminate instance', async ({ request }) => {
    const response = await request.delete(`${API_URL}/instances/${instanceId}`, {
      headers: { Authorization: `Bearer ${lifecycleUser.token}` },
    });
    expect(response.ok()).toBeTruthy();
  });
});