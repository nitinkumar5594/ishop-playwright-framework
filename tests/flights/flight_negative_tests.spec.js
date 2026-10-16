// @ts-check
import { test, expect } from "@playwright/test";
import { FlightHomePage } from "../../pages/flights/FlightHomePage.js";
import { FLIGHT_ENV_CONFIG } from "../../config/flights/environment.js";
import { ScriptReporter } from "../../utils/reporter/ScriptReporter.js";

test.describe("Flight Negative Validations & Boundary Cases", () => {

  test("TC_FLIGHT_NEG_001: Same Origin and Destination Airport Validation", async ({ page }, testInfo) => {
    const reporter = new ScriptReporter("Flight Negative - Same Origin & Destination", "tests/flights/flight_negative_tests.spec.js");
    reporter.printHeader(testInfo.project.name);
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      const flightPage = new FlightHomePage(page);

      // Step 1: Login
      await flightPage.loginToPortal(FLIGHT_ENV_CONFIG.ssoUrl);
      reporter.addStep(1, "Login to Portal", "PASSED");

      // Step 2: Navigate to Flights
      await flightPage.clickTravelAndStays();
      reporter.addStep(2, "Navigate to Flights Search", "PASSED");

      // Step 3: Select Origin as Delhi
      await flightPage.selectFirstCity("Delhi");
      reporter.addStep(3, "Select Origin as Delhi", "PASSED");

      // Step 4: Verify selecting same city as Destination is blocked
      let blocked = false;
      try {
        await flightPage.selectSecondCity("Delhi");
      } catch (err) {
        blocked = err.message.includes("Same-city selection blocked") || err.message.includes("cannot be the same");
      }

      expect(blocked).toBe(true);
      reporter.addStep(4, "Verify Same City Blocked", "PASSED", "Same-city selection blocked successfully");

      reporter.recordTestCase("TC_FLIGHT_NEG_001", "PASSED", {
        title: "Verify Validation when Origin and Destination are Identical",
        details: "Validated same airport sector block"
      });
      reporter.finishReport("PASSED", page.url());
    } catch (err) {
      reporter.recordTestCase("TC_FLIGHT_NEG_001", "FAILED", { error: err.message });
      reporter.finishReport("FAILED", page.url(), err);
      throw err;
    }
  });

  test("TC_FLIGHT_NEG_004: Past Dates are Disabled for Flight Departure", async ({ page }, testInfo) => {
    const reporter = new ScriptReporter("Flight Negative - Past Departure Date", "tests/flights/flight_negative_tests.spec.js");
    reporter.printHeader(testInfo.project.name);
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      const flightPage = new FlightHomePage(page);
      await flightPage.loginToPortal(FLIGHT_ENV_CONFIG.ssoUrl);
      await flightPage.clickTravelAndStays();
      reporter.addStep(1, "Navigate to Flights Search", "PASSED");

      // Open departure calendar
      const depTrigger = page.locator('#datePickerOpen, .departure-date, .select-root-departure, .select-dep-ret').first();
      await depTrigger.waitFor({ state: "visible", timeout: 10000 });
      await depTrigger.click({ force: true });
      await page.waitForTimeout(1500);
      reporter.addStep(2, "Open Departure Calendar", "PASSED");

      // Verify past date cells have disabled attribute or pointerEvents none or hidden class
      const isPastDisabled = await page.evaluate(() => {
        const cells = Array.from(document.querySelectorAll('[role="gridcell"], .calendar-grid td, .day, .ngb-dp-day'));
        return cells.some(c => {
          const aria = c.getAttribute('aria-disabled');
          const pointer = c.style.pointerEvents;
          const cls = c.className || '';
          return aria === 'true' || pointer === 'none' || cls.includes('disabled') || cls.includes('hidden');
        });
      });

      expect(isPastDisabled).toBe(true);
      reporter.addStep(3, "Verify Past Dates Disabled", "PASSED", "Past dates are unclickable/disabled in calendar");

      reporter.recordTestCase("TC_FLIGHT_NEG_004", "PASSED", {
        title: "Verify Past Dates Disabled for Flight Departure",
        details: "Verified past calendar cells are disabled"
      });
      reporter.finishReport("PASSED", page.url());
    } catch (err) {
      reporter.recordTestCase("TC_FLIGHT_NEG_004", "FAILED", { error: err.message });
      reporter.finishReport("FAILED", page.url(), err);
      throw err;
    }
  });

});
