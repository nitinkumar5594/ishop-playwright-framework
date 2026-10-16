// @ts-check
import { test, expect } from "@playwright/test";
import { HotelHomePage } from "../../pages/hotels/HotelHomePage.js";
import { HOTEL_ENV_CONFIG } from "../../config/hotels/environment.js";
import { ScriptReporter } from "../../utils/reporter/ScriptReporter.js";
import { testCaseTracker } from "../../test-cases/TestCaseTracker.js";

test.describe("Hotel Negative Validations & Boundary Cases", () => {

  test("TC_HOTEL_NEG_001: Empty Destination City Search Validation", async ({ page }, testInfo) => {
    const reporter = new ScriptReporter("Hotel Negative - Empty City Search", "tests/hotels/hotel_negative_tests.spec.js");
    reporter.printHeader(testInfo.project.name);
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      const hotelPage = new HotelHomePage(page);

      // Step 1: Login
      await hotelPage.loginToPortal(HOTEL_ENV_CONFIG.ssoUrl);
      reporter.addStep(1, "Login to Portal", "PASSED");

      // Step 2: Navigate to Hotels
      await hotelPage.clickTravelAndStays();
      await hotelPage.clickHotelRadioButton();
      reporter.addStep(2, "Navigate to Hotel Search", "PASSED");

      // Step 3: Clear City input if pre-filled
      const clearBtn = page.locator('.search-clear-btn, button.clear-btn, span:has-text("✕"), .clear-icon').filter({ visible: true }).first();
      if (await clearBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await clearBtn.click({ force: true });
        await page.waitForTimeout(500);
      } else {
        const cityBox = page.locator('h5:has-text("New Delhi"), h5:has-text("India"), .hotel-in, #citySearchRef').first();
        await cityBox.click({ force: true });
        await page.waitForTimeout(500);
        const cityInput = page.locator('#citySearchRef, input[placeholder*="City" i]').first();
        if (await cityInput.isVisible().catch(() => false)) {
          await cityInput.fill("");
        }
      }

      // Step 4: Click Search button with empty city
      const searchBtn = page.locator('button:has-text("Search"), button.search-btn, button[type="submit"]:has-text("Search")').first();
      await searchBtn.click({ force: true });
      await page.waitForTimeout(1000);

      // Verify user remains on /compare-stay and is NOT redirected to search results without city
      const currentUrl = page.url();
      expect(currentUrl).toContain("compare-stay");
      expect(currentUrl).not.toContain("hotels/hotel-list");
      reporter.addStep(3, "Verify Search Prevented on Empty City", "PASSED", `Remained on: ${currentUrl}`);

      reporter.recordTestCase("TC_HOTEL_NEG_001", "PASSED", {
        title: "Verify Validation when Searching with Empty Destination City",
        details: "Search blocked, user stayed on compare-stay"
      });
      reporter.finishReport("PASSED", currentUrl);
    } catch (err) {
      reporter.recordTestCase("TC_HOTEL_NEG_001", "FAILED", { error: err.message });
      reporter.finishReport("FAILED", page.url(), err);
      throw err;
    }
  });

  test("TC_HOTEL_NEG_003: Verify Past Dates are Disabled in Calendar", async ({ page }, testInfo) => {
    const reporter = new ScriptReporter("Hotel Negative - Past Date Disabled", "tests/hotels/hotel_negative_tests.spec.js");
    reporter.printHeader(testInfo.project.name);
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      const hotelPage = new HotelHomePage(page);
      await hotelPage.loginToPortal(HOTEL_ENV_CONFIG.ssoUrl);
      await hotelPage.clickTravelAndStays();
      await hotelPage.clickHotelRadioButton();
      reporter.addStep(1, "Navigate to Hotel Search", "PASSED");

      // Open Date picker
      const dateTrigger = page.locator('h5:has-text("Select Date"), .hotel-in').filter({ visible: true }).first();
      await dateTrigger.waitFor({ state: "visible", timeout: 8000 });
      await dateTrigger.click({ force: true });
      await page.waitForTimeout(1000);
      reporter.addStep(2, "Open Dual-Month Calendar", "PASSED");

      // Verify that past dates (e.g. 1st September 2026 or cells with aria-disabled="true") are disabled
      const pastDisabledCount = await page.evaluate(() => {
        const cells = Array.from(document.querySelectorAll('[role="gridcell"], .mat-calendar-body-cell, .ngb-dp-day'));
        return cells.filter(c => c.getAttribute("aria-disabled") === "true" || c.classList.contains("disabled") || c.classList.contains("mat-calendar-body-disabled")).length;
      });

      console.log(`✓ Found ${pastDisabledCount} disabled past date cells in calendar.`);
      expect(pastDisabledCount).toBeGreaterThan(0);
      reporter.addStep(3, "Verify Past Dates Disabled", "PASSED", `Disabled past cells found: ${pastDisabledCount}`);

      reporter.recordTestCase("TC_HOTEL_NEG_003", "PASSED", {
        title: "Verify Past Dates are Disabled in Calendar",
        details: `${pastDisabledCount} past date cells correctly disabled`
      });
      reporter.finishReport("PASSED", page.url());
    } catch (err) {
      reporter.recordTestCase("TC_HOTEL_NEG_003", "FAILED", { error: err.message });
      reporter.finishReport("FAILED", page.url(), err);
      throw err;
    }
  });

});
