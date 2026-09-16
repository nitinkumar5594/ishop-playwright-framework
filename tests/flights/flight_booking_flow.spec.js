// @ts-check
import { test, expect } from '@playwright/test';
import { FlightHomePage } from '../../pages/flights/FlightHomePage.js';
import { ISHOP_ENV_CONFIG } from '../../config/flights/environment.js';
import { ScriptReporter } from '../../utils/reporter/ScriptReporter.js';
import { jiraLogger } from '../../jira/JiraBugLogger.js';
import path from 'path';

test.describe('Flight Booking Flow', () => {

  test('Steps 1-16: Login -> One Way -> DEL->BOM -> Sep 10 -> Search -> View Fares -> BOOK -> Book Now -> Select Traveller -> Continue -> Confirm -> Consent -> Continue -> Wait on Payment', async ({ page }, testInfo) => {
    test.setTimeout(180000);

    // Initialize dedicated Script Reporter with diagnostic logging
    const reporter = new ScriptReporter("Flight Booking Flow", "tests/flights/flight_booking_flow.spec.js");
    reporter.printHeader(testInfo?.project?.name || "chromium");

    // Set desktop viewport so "iShop is best viewed on Portrait mode" overlay does not block elements
    await page.setViewportSize({ width: 1920, height: 1080 });
    // Dismiss the portrait/mobile overlay via JS (runs on every step via removeCookieBanner)
    await page.evaluate(() => {
      const sels = ['.portrait-overlay', '.mobile-overlay', '[class*="portrait"]', '[class*="overlay"]'];
      sels.forEach(sel => document.querySelectorAll(sel).forEach(el => {
        const s = window.getComputedStyle(el);
        if ((s.position === 'fixed' || s.position === 'absolute') && parseInt(s.zIndex || '0') > 100) el.remove();
      }));
      document.body.style.overflow = '';
    }).catch(() => {});
    reporter.attachPage(page);

    const homePage = new FlightHomePage(page);
    try {

    // ── Step 1: Login ─────────────────────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 1: Login to Portal...');
    console.log('-------------------------------------------------------------');
    await homePage.loginToPortal(ISHOP_ENV_CONFIG.ssoUrl);
    const currentUrl = await homePage.getCurrentUrl();
    console.log(`✓ Logged in. Current URL: ${currentUrl}`);

    // ── Step 2: Travel & Stay ─────────────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 2: Click on Travel & Stay Button...');
    console.log('-------------------------------------------------------------');
    await homePage.clickTravelAndStays();

    // ── Step 3: One Way ───────────────────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 3: Click on One way radio button...');
    console.log('-------------------------------------------------------------');
    await homePage.selectOneWay();

    // ── Step 4: Origin — New Delhi ────────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 4: Select New Delhi in First City Dropdown (Origin)...');
    console.log('-------------------------------------------------------------');
    await homePage.selectFirstCity('New Delhi');

    // ── Step 5: Destination — Mumbai ─────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 5: Select Mumbai in Second City Dropdown (Destination)...');
    console.log('-------------------------------------------------------------');
    await homePage.selectSecondCity('Mumbai');

    // ── Step 6: Departure Date — 10 September 2026 ────────────────────────
    //           ONE-WAY: only departure calendar, no return date interaction
    console.log('-------------------------------------------------------------');
    console.log('Step 6: Click Departure Calendar and select 10 September 2026...');
    console.log('-------------------------------------------------------------');
    await homePage.selectDepartureDate(10, 'September', 2026);

    // ── Step 7: Search ────────────────────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 7: Click Search / Submit button...');
    console.log('-------------------------------------------------------------');
    const resultUrl = await homePage.clickSubmit();
    console.log(`✓ Search clicked. Redirected to: ${resultUrl}`);

    // Verify listing page URL
    expect(resultUrl).not.toBe('');
    expect(
      resultUrl.includes('flight-list') ||
      resultUrl.includes('compare-fly') ||
      resultUrl.includes('listing') ||
      resultUrl.includes('results') ||
      resultUrl.includes('search')
    ).toBeTruthy();
    console.log(`✓ Listing/results page confirmed: ${resultUrl}`);

    // ── Step 8: View Fares ────────────────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 8: Click "View Fares" on first flight result...');
    console.log('-------------------------------------------------------------');
    await homePage.clickViewFares();

    // ── Step 9: BOOK button ───────────────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 9: Click "BOOK" button in the fare panel...');
    console.log('-------------------------------------------------------------');
    const bookUrl = await homePage.clickBookButton();
    console.log(`✓ BOOK clicked. URL: ${bookUrl}`);

    // ── Step 10: Book Now ─────────────────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 10: Click "Book Now" button on the fare/review page...');
    console.log('-------------------------------------------------------------');
    const bookNowUrl = await homePage.clickBookNow();
    console.log(`✓ Book Now clicked. URL: ${bookNowUrl}`);

    // ── Step 11: Select 2nd Traveller ─────────────────────────────────────
    //            On the "Add Travellers" checkout page, tick the 2nd traveller checkbox
    console.log('-------------------------------------------------------------');
    console.log('Step 11: Select 2nd Traveller from the Add Travellers list...');
    console.log('-------------------------------------------------------------');
    await homePage.selectTraveller(2);

    // ── Step 12: Continue ─────────────────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 12: Click "Continue" button...');
    console.log('-------------------------------------------------------------');
    await homePage.clickContinue();

    // ── Step 13: Confirm in Review Traveller Details modal ────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 13: Click "Confirm" in the Review Traveller Details modal...');
    console.log('-------------------------------------------------------------');
    const confirmUrl = await homePage.clickConfirm();
    console.log(`✓ Confirm clicked. URL: ${confirmUrl}`);

    // ── Step 14: Consent Checkbox ──────────────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 14: Click on Consent checkbox at the bottom of the page...');
    console.log('-------------------------------------------------------------');
    await homePage.clickConsentCheckbox();

    // ── Step 15: Continue on Review Page ───────────────────────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 15: Click "Continue" button on the Review page...');
    console.log('-------------------------------------------------------------');
    const finalUrl = await homePage.clickReviewContinue();
    console.log(`✓ Final Continue clicked. URL: ${finalUrl}`);

    // ── Step 16: Wait on Payment Page (Keep browser open) ───────────────────
    console.log('-------------------------------------------------------------');
    console.log('Step 16: Waiting on Payment page (browser will stay open)...');
    console.log('-------------------------------------------------------------');
    const paymentUrl = await homePage.waitForPaymentPage();
    console.log(`✓ Reached Payment page: ${paymentUrl}`);

    console.log('-------------------------------------------------------------');
    console.log('✓ Script execution completed successfully!');
    console.log('Browser is kept open on Payment page. Close the browser window when done.');
    console.log('-------------------------------------------------------------');

    // Disable timeout so browser stays open indefinitely on Payment page
    test.setTimeout(0);
    reporter.finishReport("PASSED", paymentUrl);
    if (!page.isClosed()) {
      await page.waitForEvent('close', { timeout: 0 }).catch(() => {});
    }
  } catch (err) {
    reporter.error("Flight booking execution failure: " + (err.message || String(err)), err);
    reporter.finishReport("FAILED", page.url(), err);

    let failureScreenshot = null;
    try {
      failureScreenshot = path.resolve(process.cwd(), "reports", `flight_failure_${Date.now()}.png`);
      if (!page.isClosed()) {
        await page.screenshot({ path: failureScreenshot }).catch(() => {});
      }
    } catch (_) {}

    await jiraLogger.logBug({
      title: `Flight Booking Flow - ${(err.message || String(err)).slice(0, 80)}`,
      projectTag: "ICICISHP",
      feature: "FLIGHT",
      platform: "DESKTOP",
      steps: [
        "Launch application via SSO URL.",
        "Select One Way flight from DEL to BOM.",
        "Select travel date and search flights.",
        "Click View Fares and click Book.",
        "Select Traveller, Confirm, Agree to Consent, and proceed to Payment."
      ],
      actual: `Flight booking flow encountered failure: ${err.message || String(err)}`,
      expected: "User should select flights, confirm traveller details, accept consent, and reach payment page.",
      error: err,
      pageUrl: page.url(),
      screenshotPath: failureScreenshot,
      testFile: "tests/flights/flight_booking_flow.spec.js"
    }).catch(jErr => console.warn("[Jira] Non-blocking logger note:", jErr.message));

    throw err;
  }
  });

});


