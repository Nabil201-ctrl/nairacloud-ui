# NairaCloud Browser Testing

This directory contains Playwright end-to-end tests for the NairaCloud VPS provisioning platform.

## Test Structure

```
apps/
├── web/tests/           # Customer portal tests
│   ├── fixtures.ts      # Test fixtures (auth, test users)
│   ├── utils.ts         # Helper functions
│   ├── vps-provisioning.spec.ts  # Main VPS provisioning tests
│   └── api-integration.spec.ts   # API + UI integration tests
└── admin/tests/         # Admin portal tests
    ├── fixtures.ts      # Admin test fixtures
    ├── utils.ts         # Admin helper functions
    └── admin-provisioning.spec.ts  # Admin provisioning tests
```

## Running Tests

### Install Dependencies
```bash
cd frontend
npm install
npm run test:e2e:install
```

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test Suites
```bash
# Customer portal tests
npm run test:e2e:web

# Admin portal tests
npm run test:e2e:admin

# With UI mode
npm run test:e2e:ui
```

### Run Tests in CI
```bash
npm run test:e2e -- --reporter=github
```

## Test Configuration

- `playwright.config.ts` - Customer portal (web app) config
- `playwright.admin.config.ts` - Admin portal config

Both configurations:
- Run tests in parallel
- Retry failed tests in CI (2 retries)
- Capture traces, screenshots, and videos on failure
- Start dev servers automatically (reuses existing in local dev)

## Test Scenarios

### Customer Portal (Web App)
1. **Authentication Flow**
   - User signup and email verification
   - User login/logout

2. **VPS Instance Provisioning**
   - View available plans
   - Create new VPS instance
   - Add SSH keys
   - Instance appears in dashboard

3. **Instance Management**
   - View instance details
   - Access console/terminal
   - Power operations (start, stop, restart)
   - View metrics

4. **Billing & Subscriptions**
   - Billing overview
   - Payment methods
   - Invoices

5. **Support**
   - Create support tickets

6. **API Keys**
   - Create and manage API keys

### Admin Portal
1. **Dashboard**
   - System health metrics
   - Overview stats

2. **Plan Management**
   - List plans
   - Create/edit/disable plans

3. **Node Management**
   - List nodes
   - Register new nodes
   - View node details/metrics
   - Maintenance mode
   - Drain nodes

4. **Instance Management**
   - List all customer instances
   - Filter by status
   - View details
   - Suspend/terminate instances

5. **Customer Management**
   - List customers
   - View details
   - Suspend accounts

6. **Billing**
   - Payments overview
   - Transactions
   - Invoices

7. **Audit Logs**
   - View audit logs
   - Filter by action/resource/user

8. **Incidents**
   - View incidents
   - Create incidents

9. **Abuse Management**
   - View abuse cases
   - Resolve cases

10. **System Settings**

### API Integration Tests
- Complete provisioning flow via API + UI
- Multi-user concurrent provisioning
- Instance lifecycle operations (stop, start, restart, rebuild, terminate)

## Writing New Tests

1. Create test file in appropriate `tests/` directory
2. Import fixtures from `./fixtures`
3. Use utils from `./utils`
4. Follow existing patterns for selectors and assertions

### Selectors
Prefer data-testid attributes:
```tsx
// In component
<button data-testid="create-instance">Create</button>

// In test
await page.click('[data-testid="create-instance"]');
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Frontend URL | `http://localhost:3001` |
| `API_URL` | Backend API URL | `http://localhost:3000` |
| `ADMIN_EMAIL` | Admin test email | `admin@nairacloud.test` |
| `ADMIN_PASSWORD` | Admin test password | `AdminPassword123!` |

## CI/CD Integration

Tests run automatically on PRs via GitHub Actions. See `.github/workflows/ci.yml` for configuration.

## Debugging

```bash
# Run with headed browser
npx playwright test --headed

# Run specific test with debug
npx playwright test vps-provisioning.spec.ts --debug

# View trace
npx playwright show-trace trace.zip
```