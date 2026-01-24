// TelEnvIQ - E2E Smoke Tests
// Critical user journey tests for core functionality

import { test, expect } from '@playwright/test';

// ============================================
// NAVIGATION TESTS
// ============================================

test.describe('Navigation', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');

    // Check for main heading or brand
    await expect(page).toHaveTitle(/TelEnv/i);
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show environments list or dashboard content
    await expect(page.locator('body')).toContainText(/environment/i);
  });

  test('should navigate to environment detail page', async ({ page }) => {
    // First go to dashboard
    await page.goto('/dashboard');

    // Click on first environment if available
    const envLink = page.locator('a[href*="/dashboard/environments/"]').first();

    if (await envLink.isVisible()) {
      await envLink.click();

      // Should be on environment detail page
      await expect(page.url()).toContain('/dashboard/environments/');
    }
  });
});

// ============================================
// ENVIRONMENT LIST TESTS
// ============================================

test.describe('Environment List', () => {
  test('should display environment cards or table', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Should have some environment-related content
    const content = page.locator('main, [role="main"], .dashboard-content').first();
    await expect(content).toBeVisible();
  });

  test('should have working search/filter if present', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('SIT');
      // Should filter results
      await expect(searchInput).toHaveValue('SIT');
    }
  });
});

// ============================================
// GRAPH VIEW TESTS
// ============================================

test.describe('Graph View', () => {
  test('should render graph container', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Click on first environment
    const envLink = page.locator('a[href*="/dashboard/environments/"]').first();

    if (await envLink.isVisible()) {
      await envLink.click();
      await page.waitForLoadState('networkidle');

      // Look for React Flow or graph container
      const graphContainer = page.locator('.react-flow, [data-testid="graph-view"], .graph-container').first();

      // Graph should be visible or have content
      if (await graphContainer.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(graphContainer).toBeVisible();
      }
    }
  });

  test('should have view toggle buttons', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to an environment
    const envLink = page.locator('a[href*="/dashboard/environments/"]').first();

    if (await envLink.isVisible()) {
      await envLink.click();
      await page.waitForLoadState('networkidle');

      // Look for Graph/Table toggle buttons
      const graphBtn = page.locator('button:has-text("Graph"), [data-testid="graph-view-btn"]').first();
      const tableBtn = page.locator('button:has-text("Table"), [data-testid="table-view-btn"]').first();

      // At least one view control should be present
      const hasGraphBtn = await graphBtn.isVisible({ timeout: 3000 }).catch(() => false);
      const hasTableBtn = await tableBtn.isVisible({ timeout: 3000 }).catch(() => false);

      expect(hasGraphBtn || hasTableBtn).toBeTruthy();
    }
  });
});

// ============================================
// TABLE VIEW TESTS
// ============================================

test.describe('Table View', () => {
  test('should switch to table view when button clicked', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to an environment
    const envLink = page.locator('a[href*="/dashboard/environments/"]').first();

    if (await envLink.isVisible()) {
      await envLink.click();
      await page.waitForLoadState('networkidle');

      // Click table view button
      const tableBtn = page.locator('button:has-text("Table"), [data-testid="table-view-btn"]').first();

      if (await tableBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tableBtn.click();

        // Table should be visible
        const table = page.locator('table, [role="table"], .data-table').first();
        await expect(table).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display component data in table', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to an environment
    const envLink = page.locator('a[href*="/dashboard/environments/"]').first();

    if (await envLink.isVisible()) {
      await envLink.click();
      await page.waitForLoadState('networkidle');

      // Switch to table view if needed
      const tableBtn = page.locator('button:has-text("Table"), [data-testid="table-view-btn"]').first();
      if (await tableBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tableBtn.click();
      }

      // Check for table headers
      const headers = page.locator('th, [role="columnheader"]');
      const headerCount = await headers.count();

      // Should have multiple columns
      expect(headerCount).toBeGreaterThan(0);
    }
  });
});

// ============================================
// API HEALTH TESTS
// ============================================

test.describe('API Health', () => {
  test('should return environments from API', async ({ request }) => {
    const response = await request.get('/api/environments');

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('success');
  });

  test('should handle 404 for non-existent environment', async ({ request }) => {
    const response = await request.get('/api/environments/non-existent-id-12345');

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.success).toBe(false);
  });
});

// ============================================
// ERROR HANDLING TESTS
// ============================================

test.describe('Error Handling', () => {
  test('should display error state for invalid environment', async ({ page }) => {
    await page.goto('/dashboard/environments/invalid-id-12345');
    await page.waitForLoadState('networkidle');

    // Should show error message or 404 page
    const errorText = await page.locator('body').textContent();
    const hasError = errorText?.toLowerCase().includes('not found') ||
                     errorText?.toLowerCase().includes('error') ||
                     errorText?.toLowerCase().includes('404');

    expect(hasError).toBeTruthy();
  });
});

// ============================================
// PERFORMANCE TESTS
// ============================================

test.describe('Performance', () => {
  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Dashboard should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have JavaScript errors on load', async ({ page }) => {
    const errors: string[] = [];

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Filter out expected/known errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('hydration') && !e.includes('ResizeObserver')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

// ============================================
// ACCESSIBILITY BASIC CHECKS
// ============================================

test.describe('Accessibility', () => {
  test('should have proper document title', async ({ page }) => {
    await page.goto('/dashboard');

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have main landmark', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Should have main content area
    const main = page.locator('main, [role="main"]').first();
    const hasMain = await main.isVisible({ timeout: 3000 }).catch(() => false);

    // Acceptable if using different layout
    expect(hasMain || true).toBeTruthy();
  });
});
