// Nexorium Core - Authentication E2E Tests
// Tests for login, logout, and route protection

import { test, expect } from '@playwright/test';

// Test credentials should be set via environment variables
// TEST_EMAIL and TEST_PASSWORD
// DO NOT hardcode credentials in this file

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we start logged out by clearing cookies
    await page.context().clearCookies();
  });

  test('unauthenticated user visiting protected route is redirected to login', async ({
    page,
  }) => {
    // Try to access a protected route
    await page.goto('/dashboard/environments');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);

    // Login page should show the sign-in form
    await expect(page.locator('h1')).toContainText('Welcome back');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('unauthenticated user visiting /governance is redirected to login', async ({
    page,
  }) => {
    await page.goto('/dashboard/governance');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user visiting /impact is redirected to login', async ({
    page,
  }) => {
    await page.goto('/dashboard/impact');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user visiting /insight is redirected to login', async ({
    page,
  }) => {
    await page.goto('/dashboard/insight');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user visiting /organisation is redirected to login', async ({
    page,
  }) => {
    await page.goto('/dashboard/organisation');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated user visiting /configuration is redirected to login', async ({
    page,
  }) => {
    await page.goto('/dashboard/configuration');
    await expect(page).toHaveURL(/\/login/);
  });

  test('public landing page is accessible without authentication', async ({
    page,
  }) => {
    await page.goto('/');
    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('login page is accessible without authentication', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click sign in
    await page.click('button[type="submit"]');

    // Should show an error message
    await expect(page.locator('text=Invalid login credentials')).toBeVisible({
      timeout: 10000,
    });

    // Should still be on login page
    await expect(page).toHaveURL('/login');
  });

  // Tests that require valid credentials - skip if not provided
  test.describe('With valid credentials', () => {
    test.skip(
      !TEST_EMAIL || !TEST_PASSWORD,
      'Skipping: TEST_EMAIL and TEST_PASSWORD environment variables not set'
    );

    test('successful login redirects to dashboard', async ({ page }) => {
      await page.goto('/login');

      // Fill in valid credentials
      await page.fill('input[type="email"]', TEST_EMAIL!);
      await page.fill('input[type="password"]', TEST_PASSWORD!);

      // Click sign in
      await page.click('button[type="submit"]');

      // Should redirect to environments page
      await expect(page).toHaveURL(/\/dashboard\/environments/, {
        timeout: 15000,
      });

      // Should show the environments page content
      await expect(page.locator('text=Environments')).toBeVisible();
    });

    test('login with redirect parameter returns to original destination', async ({
      page,
    }) => {
      // Try to access governance page while logged out
      await page.goto('/dashboard/governance');

      // Should redirect to login with redirect param
      await expect(page).toHaveURL(/\/login\?redirect=/);

      // Log in
      await page.fill('input[type="email"]', TEST_EMAIL!);
      await page.fill('input[type="password"]', TEST_PASSWORD!);
      await page.click('button[type="submit"]');

      // Should redirect back to governance
      await expect(page).toHaveURL(/\/dashboard\/governance/, {
        timeout: 15000,
      });
    });

    test('logout clears session and redirects to login', async ({ page }) => {
      // First log in
      await page.goto('/login');
      await page.fill('input[type="email"]', TEST_EMAIL!);
      await page.fill('input[type="password"]', TEST_PASSWORD!);
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard\/environments/, {
        timeout: 15000,
      });

      // Click logout button
      await page.click('button:has-text("Sign out")');

      // Should redirect to login
      await expect(page).toHaveURL('/login', { timeout: 10000 });

      // Try to access protected route again
      await page.goto('/dashboard/environments');

      // Should be redirected back to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('authenticated user visiting login is redirected to dashboard', async ({
      page,
    }) => {
      // First log in
      await page.goto('/login');
      await page.fill('input[type="email"]', TEST_EMAIL!);
      await page.fill('input[type="password"]', TEST_PASSWORD!);
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard\/environments/, {
        timeout: 15000,
      });

      // Try to visit login page
      await page.goto('/login');

      // Should be redirected back to dashboard
      await expect(page).toHaveURL(/\/dashboard\/environments/, {
        timeout: 10000,
      });
    });
  });
});
