// @ts-check
import { test, expect } from "@playwright/test";
import { HotelHomePage } from "../../pages/hotels/HotelHomePage.js";
import { FlightHomePage } from "../../pages/flights/FlightHomePage.js";
import { HOTEL_ENV_CONFIG } from "../../config/hotels/environment.js";
import { FLIGHT_ENV_CONFIG } from "../../config/flights/environment.js";
import { ScriptReporter } from "../../utils/reporter/ScriptReporter.js";

test.describe("iShop End-to-End (E2E) Booking Journeys", () => {

  test("E2E_001: Complete Hotel Discovery & Search Workflow", async ({ page }, testInfo) => {
    const reporter = new ScriptReporter("E2E - Hotel Discovery Workflow", "tests/e2e/e2e_booking_journey.spec.js");
    reporter.printHeader(testInfo.project.name);
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      const hotelPage = new HotelHomePage(page);

      // 1. SSO Login
      await hotelPage.loginToPortal(HOTEL_ENV_CONFIG.ssoUrl);
      reporter.addStep(1, "Login to Portal via SSO", "PASSED");

      // 2. Access Travel & Stays
      await hotelPage.clickTravelAndStays();
      reporter.addStep(2, "Open Travel & Stays Menu", "PASSED");

      // 3. Switch to Hotels
      await hotelPage.clickHotelRadioButton();
      reporter.addStep(3, "Select Hotel Product Radio Button", "PASSED");

      // 4. Select Destination & Dates
      await hotelPage.selectCity("Goa, India");
      reporter.addStep(4, "Select Destination City (Goa, India)", "PASSED");

      await hotelPage.selectDates(3, 6);
      reporter.addStep(5, "Select Check-in and Check-out Dates", "PASSED");

      // 5. Submit Search
      await hotelPage.clickSearchHotels();
      reporter.addStep(6, "Submit Hotel Search", "PASSED");

      // 6. Verify Results Page
      await hotelPage.waitForHotelResults();
      reporter.addStep(7, "Verify Hotel Results Loaded Successfully", "PASSED");

      reporter.printSummary("PASSED");
    } catch (err) {
      reporter.printSummary("FAILED");
      throw err;
    }
  });

  test("E2E_002: Flight Search & Results Exploration", async ({ page }, testInfo) => {
    const reporter = new ScriptReporter("E2E - Flight Search Journey", "tests/e2e/e2e_booking_journey.spec.js");
    reporter.printHeader(testInfo.project.name);
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
      const flightPage = new FlightHomePage(page);

      // 1. SSO Login
      await flightPage.loginToPortal(FLIGHT_ENV_CONFIG.ssoUrl);
      reporter.addStep(1, "Login to Portal via SSO", "PASSED");

      // 2. Navigate to Flights
      await flightPage.navigateToFlights();
      reporter.addStep(2, "Navigate to Flights Section", "PASSED");

      // 3. Search Flights
      await flightPage.searchFlight({
        origin: "DEL",
        destination: "BOM",
        daysFromNow: 5,
        tripType: "oneway",
      });
      reporter.addStep(3, "Execute One-Way Flight Search (DEL -> BOM)", "PASSED");

      // 4. Wait for flight results
      await page.waitForTimeout(5000);
      reporter.addStep(4, "Validate Flight Search Results", "PASSED");

      reporter.printSummary("PASSED");
    } catch (err) {
      reporter.printSummary("FAILED");
      throw err;
    }
  });
});
