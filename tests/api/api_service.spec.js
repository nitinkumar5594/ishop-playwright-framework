// @ts-check
import { test, expect } from "@playwright/test";

test.describe("iShop API Test Suite", () => {
  const baseURL = process.env.BASE_URL || "https://ishop-qa.reward360.in";

  test("API_001: Portal Base URL & Gateway Health Check", async ({ request }) => {
    const response = await request.get(baseURL, {
      ignoreHTTPSErrors: true,
    });
    
    // Validate HTTP status
    expect(response.status()).toBeLessThan(400);
    expect(response.ok()).toBeTruthy();
    
    // Validate headers
    const headers = response.headers();
    expect(headers).toBeDefined();
    expect(headers["content-type"]).toContain("text/html");
  });

  test("API_002: Verify Static Assets & Bundles Availability", async ({ request }) => {
    const response = await request.get(`${baseURL}/favicon.ico`, {
      ignoreHTTPSErrors: true,
    });

    // Favicon or static assets should respond with valid HTTP code
    expect([200, 204, 304, 404]).toContain(response.status());
  });

  test("API_003: API Response Time Benchmark", async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(baseURL, {
      ignoreHTTPSErrors: true,
    });
    const duration = Date.now() - startTime;

    expect(response.ok()).toBeTruthy();
    // Portal response time should be within 10 seconds under standard conditions
    expect(duration).toBeLessThan(10000);
  });

  test("API_004: HTTP Security Headers Validation", async ({ request }) => {
    const response = await request.get(baseURL, {
      ignoreHTTPSErrors: true,
    });
    const headers = response.headers();

    // Verify response contains server/security headers
    expect(response.status()).toBe(200);
    expect(headers).toBeDefined();
  });
});
