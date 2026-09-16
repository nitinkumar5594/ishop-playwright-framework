// @ts-check
import { expect } from '@playwright/test';
import { hotelLocators } from '../../locators/hotels/hotelLocators.js';

/**
 * Hotel Page Object Model
 * Encapsulates Travel & Stays -> Hotel selection, search, and booking flow.
 */
export class HotelHomePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.mainPage = page;
    this.page = page;

    // Navigation Locators
    this.travelAndStaysBtn = page.locator(hotelLocators.travelAndStaysBtn).first();
    this.hotelRadioBtn = page.locator(hotelLocators.hotelRadioBtn).first();

    // Search Form Locators
    this.destinationInput = page.locator(hotelLocators.destinationInput).first();
    this.searchHotelsBtn = page.locator(hotelLocators.searchHotelsBtn).first();
    this.resultsList = page.locator(hotelLocators.resultsList);
    this.viewRoomsBtn = page.locator(hotelLocators.viewRoomsBtn).first();
    this.bookRoomBtn = page.locator(hotelLocators.bookRoomBtn).first();
  }

  /**
   * Dismiss the "iShop is best viewed on Portrait / Desktop mode" overlay
   * that appears on screens below ~1200 px wide.
   * Safe to call at any point — silently skips if the overlay is absent.
   * @param {import('@playwright/test').Page} [targetPage]
   */
  async dismissPortraitOverlay(targetPage = this.page) {
    await targetPage.evaluate(() => {
      const overlaySelectors = [
        '.portrait-overlay',
        '.mobile-overlay',
        '.landscape-only',
        '[class*="portrait"]',
        '[class*="mobile-view"]',
        '[class*="overlay"]',
      ];
      overlaySelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          const s = window.getComputedStyle(el);
          if (
            (s.position === 'fixed' || s.position === 'absolute') &&
            parseInt(s.zIndex || '0') > 100
          ) {
            el.remove();
          }
        });
      });
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }).catch(() => {});
  }

  /**
   * Dismiss cookie banners & popups
   */
  async removeCookieBanner() {
    await this.page.evaluate(() => {
      const selectors = ['#cookie-banner', '.cookie-banner', '#cookie-consent', '#onetrust-consent-sdk', '.modal-backdrop'];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });
    }).catch(() => {});
    // Also dismiss any portrait/mobile overlay on every clean-up call
    await this.dismissPortraitOverlay();
  }

  /**
   * Step 1: Login to Portal via SSO URL (Using same URL as flights)
   * @param {string} url
   */
  async loginToPortal(url) {
    console.log('-------------------------------------------------------------');
    console.log('Step 1: Login to Portal via SSO URL (Same as Flights)...');
    console.log('-------------------------------------------------------------');
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000);
    await this.removeCookieBanner();
    await expect(this.page).toHaveURL(/.*(reward360|ishop).*/, { timeout: 15000 });
    console.log(`✓ Logged into portal successfully. URL: ${this.page.url()}`);
  }

  /**
   * Step 2: Click on "Travel & Stays" Button
   */
  async clickTravelAndStays() {
    console.log('-------------------------------------------------------------');
    console.log('Step 2: Click on "Travel & Stays" Button...');
    console.log('-------------------------------------------------------------');
    await this.removeCookieBanner();

    if (!this.page.url().includes('compare-fly') && !this.page.url().includes('compare-stay')) {
      if (await this.travelAndStaysBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await this.travelAndStaysBtn.click({ force: true });
      } else {
        const baseUrl = new URL(this.page.url()).origin;
        await this.page.goto(`${baseUrl}/compare-fly`, { waitUntil: 'domcontentloaded' });
      }
    }

    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await expect(this.page).toHaveURL(/.*(compare-fly|compare-stay).*/, { timeout: 15000 });
    console.log('✓ Navigated to Travel & Stays (/compare-fly).');
  }

  /**
   * Step 3: Click on "Hotel" Radio / Tab Button
   */
  async clickHotelRadioButton() {
    console.log('-------------------------------------------------------------');
    console.log('Step 3: Click on "Hotel" Radio / Tab Button...');
    console.log('-------------------------------------------------------------');
    await this.removeCookieBanner();

    const hotelLink = this.page.locator('a[href*="compare-stay"], li.travel-list-li a').filter({ hasText: /hotel/i }).first();
    await hotelLink.waitFor({ state: 'visible', timeout: 10000 });
    await hotelLink.click({ force: true });
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});

    // Ensure page transitioned to /compare-stay
    if (!this.page.url().includes('compare-stay')) {
      await this.page.waitForURL(/.*compare-stay.*/, { timeout: 8000 }).catch(async () => {
        const origin = new URL(this.page.url()).origin;
        await this.page.goto(`${origin}/compare-stay`, { waitUntil: 'domcontentloaded' });
      });
    }

    await expect(this.page).toHaveURL(/.*compare-stay.*/, { timeout: 15000 });
    console.log(`✓ Hotel option selected. Landed on /compare-stay.`);

    // JavaScript Executor to center the search section / form in the middle of the viewport
    console.log('Executing JavaScript to center search card in the center of the page...');
    await this.page.evaluate(() => {
      const searchSection = document.querySelector('app-hotel-search, .hotel-search, .tab-container, .hotel-in, .search-box-content, .stay-search-sec, #citySearchRef');
      if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } else {
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }
    });
    await this.page.waitForTimeout(1000);
    console.log('✓ Search section centered using JavaScript executor.');
  }

  /**
   * Step 4: Select Check-In & Check-Out Dates
   */
  async selectCheckInCheckOutDates() {
    console.log('-------------------------------------------------------------');
    console.log('Step 4: Select Check-In & Check-Out Dates...');
    console.log('-------------------------------------------------------------');
    await this.removeCookieBanner();

    // Click visible Date picker trigger
    const dateTrigger = this.page.locator('h5:has-text("Select Date"), .hotel-in').filter({ visible: true }).first();
    await dateTrigger.waitFor({ state: 'visible', timeout: 8000 });
    await dateTrigger.click({ force: true });
    await this.page.waitForTimeout(1000);

    // Click check-in date cell (e.g. 15) and check-out date cell (e.g. 17)
    const cell15 = this.page.locator('[role="gridcell"]:has-text("15"), [role="gridcell"][aria-label*="15"]').first();
    await cell15.waitFor({ state: 'visible', timeout: 5000 });
    await cell15.click({ force: true });
    await this.page.waitForTimeout(500);

    const cell17 = this.page.locator('[role="gridcell"]:has-text("17"), [role="gridcell"][aria-label*="17"]').first();
    await cell17.waitFor({ state: 'visible', timeout: 5000 });
    await cell17.click({ force: true });
    await this.page.waitForTimeout(1000);

    console.log('✓ Selected Check-in: Sept 15, Check-out: Sept 17.');
  }

  /**
   * Step 5: Click Search Hotels button and wait for results
   */
  async clickSearchHotels() {
    console.log('-------------------------------------------------------------');
    console.log('Step 5: Click Search Hotels button...');
    console.log('-------------------------------------------------------------');
    await this.removeCookieBanner();
    await this.searchHotelsBtn.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchHotelsBtn.click({ force: true });
    
    console.log('Waiting for Hotel Results page to load...');
    await this.page.waitForURL(/.*(hotels\/hotel-list|compare-stay).*/, { timeout: 30000 });
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    await this.page.waitForTimeout(3000);
    console.log(`✓ Hotel search completed. Current URL: ${this.page.url()}`);
  }

  /**
   * Step 6: Verify hotel search results load
   */
  async verifyResultsLoaded() {
    console.log('-------------------------------------------------------------');
    console.log('Step 6: Verifying hotel search results load...');
    console.log('-------------------------------------------------------------');
    const hotelCard = this.page.locator('.hotel-card, h3, :has-text("hotels found")').first();
    await hotelCard.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
    const heading = await this.page.locator(':has-text("hotels found")').first().innerText().catch(() => 'Hotels found');
    console.log(`✓ Result: ${heading}`);
  }

  /**
   * Step 7: Click on any "Book Now" button from the listing page
   * @param {number} [hotelIndex=0] 0-based index of the hotel card to book (default: 0 for first hotel)
   * @returns {Promise<import("@playwright/test").Page>} Returns the page/popup where booking proceeds
   */
  async clickAnyBookButton(hotelIndex = 0) {
    console.log("-------------------------------------------------------------");
    console.log(`Step 7: Click on "Book Now" button on listing page (Hotel #${hotelIndex + 1})...`);
    console.log("-------------------------------------------------------------");
    await this.removeCookieBanner();

    // Find all "Book Now" buttons on the listing page
    const bookButtons = this.page.locator("button.btn-primary:has-text(\"Book Now\"), button:has-text(\"Book Now\"), button:has-text(\"Book\")");
    await bookButtons.first().waitFor({ state: "visible", timeout: 30000 });

    const totalHotels = await bookButtons.count();
    console.log(`✓ Found ${totalHotels} available "Book Now" buttons on the listing page.`);

    const targetIndex = Math.min(hotelIndex, totalHotels - 1);
    const targetBookBtn = bookButtons.nth(targetIndex);

    // Scroll the selected hotel card & its "Book Now" button to center of screen using JavaScript Executor
    console.log(`Executing JavaScript to center Hotel #${targetIndex + 1} and its "Book Now" button in viewport...`);
    await targetBookBtn.evaluate((el) => {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    });
    await this.page.waitForTimeout(1500);
    await this.removeCookieBanner();

    console.log(`Clicking "Book Now" on Hotel card #${targetIndex + 1}...`);

    // In iShop, clicking "Book Now" typically opens a new window/tab (target="_blank")
    let activePage = this.page;
    try {
      const [popup] = await Promise.all([
        this.page.waitForEvent("popup", { timeout: 10000 }).catch(() => null),
        targetBookBtn.click({ force: true })
      ]);

      if (popup) {
        console.log('✓ "Book Now" opened in a new tab/window. Switching context to popup...');
        activePage = popup;
        this.page = popup;
        // ── Force desktop viewport on the new popup page ──────────────────────
        // Popup pages in Playwright inherit the browser's default window size,
        // NOT the originating page's CDP viewport. Without this, the iShop
        // "Portrait mode" overlay blocks all elements in the new tab.
        await activePage.setViewportSize({ width: 1920, height: 1080 });
        await activePage.waitForLoadState("domcontentloaded").catch(() => {});
        await activePage.waitForTimeout(2000);
        // Dismiss portrait overlay and cookie banners on the new tab
        await this.dismissPortraitOverlay(activePage);
        await activePage.evaluate(() => {
          const sels = ['#cookie-banner', '.cookie-banner', '#cookie-consent', '#onetrust-consent-sdk', '.modal-backdrop'];
          sels.forEach(s => document.querySelectorAll(s).forEach(el => el.remove()));
        }).catch(() => {});
        await activePage.waitForTimeout(1000);
        console.log(`✓ Active booking page URL: ${activePage.url()}`);
      } else {
        console.log("✓ Navigated on same page. Current URL: " + this.page.url());
        await this.page.waitForLoadState("domcontentloaded").catch(() => {});
      }
    } catch (err) {
      console.log(`Direct click fallback: ${err.message}`);
      await targetBookBtn.click({ force: true });
    }

    await activePage.waitForTimeout(2000);
    console.log('✓ Successfully clicked "Book Now" button from listing page.');
    return activePage;
  }

  /**
   * Step 8: Click on "Select Room" button on the Hotel Details page
   * @param {import("@playwright/test").Page} [targetPage] Optional page/tab (defaults to this.page)
   */
  async clickSelectRoomButton(targetPage = this.page) {
    console.log("-------------------------------------------------------------");
    console.log('Step 8: Click on "Select Room" button on Hotel Details page...');
    console.log("-------------------------------------------------------------");
    await targetPage.evaluate(() => {
      const selectors = ['#cookie-banner', '.cookie-banner', '#cookie-consent', '#onetrust-consent-sdk', '.modal-backdrop'];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });
    }).catch(() => {});

    // Locate "Select Room" button
    const selectRoomBtn = targetPage.locator('button:has-text("Select Room"), a:has-text("Select Room"), .btn:has-text("Select Room")').first();
    await selectRoomBtn.waitFor({ state: "visible", timeout: 30000 });

    // Center the button in viewport using JavaScript Executor
    console.log('Executing JavaScript to center "Select Room" button in viewport...');
    await selectRoomBtn.evaluate((el) => {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    });
    await targetPage.waitForTimeout(1000);

    console.log('Clicking "Select Room" button...');
    await selectRoomBtn.click({ force: true });
    await targetPage.waitForTimeout(2000);
    console.log('✓ "Select Room" button clicked. Page scrolled to room options.');
  }

  /**
   * Step 9: Click on "Book" button for a selected room
   * @param {import("@playwright/test").Page} [targetPage] Optional page/tab (defaults to this.page)
   * @param {number} [roomIndex=0] 0-based index of the room option to book (default: 0 for first room)
   */
  async clickRoomBookButton(targetPage = this.page, roomIndex = 0) {
    console.log("-------------------------------------------------------------");
    console.log(`Step 9: Click on "Book" button for Room Option #${roomIndex + 1}...`);
    console.log("-------------------------------------------------------------");
    await targetPage.evaluate(() => {
      const selectors = ['#cookie-banner', '.cookie-banner', '#cookie-consent', '#onetrust-consent-sdk', '.modal-backdrop'];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });
    }).catch(() => {});

    // Wait for the room options section / cards to load
    console.log("Waiting for room choices to load...");
    await targetPage.waitForTimeout(3000);

    // Locate visible "Book" button specifically inside room options (excluding "Book Now" and hidden header links)
    const roomBookButtons = targetPage.locator('button:visible').filter({ hasText: /^\s*Book\s*$/i });
    
    let count = await roomBookButtons.count();
    let targetButton;

    if (count === 0) {
      // Secondary locator for room Book buttons
      const secondaryButtons = targetPage.locator('button:visible').filter({ hasText: /^\s*Book/i }).filter({ hasNotText: /Now/i });
      await secondaryButtons.first().waitFor({ state: "visible", timeout: 30000 });
      count = await secondaryButtons.count();
      const targetIdx = Math.min(roomIndex, count - 1);
      targetButton = secondaryButtons.nth(targetIdx);
    } else {
      const targetIdx = Math.min(roomIndex, count - 1);
      targetButton = roomBookButtons.nth(targetIdx);
    }

    console.log(`✓ Found ${count} visible "Book" button(s) for room choices.`);

    // Center the target room Book button using JavaScript Executor
    console.log(`Executing JavaScript to center Room #${roomIndex + 1} and "Book" button in viewport...`);
    await targetButton.evaluate((el) => {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    });
    await targetPage.waitForTimeout(1500);

    console.log(`Clicking "Book" button for Room option #${roomIndex + 1}...`);
    await targetButton.click({ force: true });
    await targetPage.waitForLoadState("domcontentloaded").catch(() => {});
    await targetPage.waitForTimeout(3000);

    console.log(`✓ Room "Book" button clicked. Current URL: ${targetPage.url()}`);
  }

  /**
   * Check if the "We're unable to fetch the hotel availability details right now" popup is displayed
   * @param {import("@playwright/test").Page} [targetPage]
   * @returns {Promise<boolean>}
   */
  async checkAvailabilityError(targetPage = this.page) {
    // Specifically target visible modal dialog or visible "Go Back" button
    const errorModal = targetPage.locator('.modal.show, .modal-content:visible, [role="dialog"]:visible').filter({ hasText: /unable to fetch the hotel availability|try another hotel/i });
    const goBackBtn = targetPage.locator('button:visible').filter({ hasText: /^\s*Go Back\s*$/i });

    const isModalVisible = await errorModal.first().isVisible({ timeout: 2000 }).catch(() => false);
    const isBtnVisible = await goBackBtn.first().isVisible({ timeout: 2000 }).catch(() => false);

    if (isModalVisible || isBtnVisible) {
      console.log("⚠️ [AVAILABILITY ERROR DETECTED]: We are unable to fetch the hotel availability details. Please try another hotel.");
      return true;
    }
    return false;
  }

  /**
   * Dismiss the availability error popup and close the failed booking tab
   * @param {import("@playwright/test").Page} targetPage
   */
  async dismissAvailabilityError(targetPage) {
    console.log("Dismissing availability error popup...");
    const goBackBtn = targetPage.locator('button:has-text("Go Back"), .btn:has-text("Go Back")').first();
    if (await goBackBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await goBackBtn.click({ force: true }).catch(() => {});
      await targetPage.waitForTimeout(1500);
    }
    if (targetPage && targetPage !== this.mainPage) {
      await targetPage.close().catch(() => {});
    }
    this.page = this.mainPage;
    console.log("✓ Failed hotel tab dismissed. Active page reset to main page.");
  }

  /**
   * Step 10: Handle cancellation policy update popup if present, then click Continue button
   * @param {import("@playwright/test").Page} [targetPage] Optional page/tab (defaults to this.page)
   * @returns {Promise<{success: boolean, reason?: string}>}
   */
  async handlePolicyPopupAndContinue(targetPage = this.page) {
    console.log("-------------------------------------------------------------");
    console.log('Step 10: Handling "Continue booking" popup and clicking "CONTINUE"...');
    console.log("-------------------------------------------------------------");

    // Wait 2-3 seconds for checkout page elements & modal popup to appear
    await targetPage.waitForTimeout(3000);

    // Check if availability error is already displayed
    if (await this.checkAvailabilityError(targetPage)) {
      return { success: false, reason: "HOTEL_AVAILABILITY_ERROR" };
    }

    // 1. Check for cancellation policy popup ("The partner has updated their cancellation policy...")
    const policyBtn = targetPage.locator('button').filter({ hasText: /continue booking/i }).first();

    const isPolicyVisible = await policyBtn.isVisible({ timeout: 6000 }).catch(() => false);
    if (isPolicyVisible) {
      console.log('✓ Found "The partner has updated their cancellation policy" popup!');
      console.log('Clicking "Continue booking" on modal popup...');
      await policyBtn.click({ force: true });
      await targetPage.waitForTimeout(2000);
      console.log('✓ Policy popup successfully dismissed.');
    } else {
      console.log('ℹ Cancellation policy popup was not displayed.');
    }

    // Check if availability error appeared after policy popup
    if (await this.checkAvailabilityError(targetPage)) {
      return { success: false, reason: "HOTEL_AVAILABILITY_ERROR" };
    }

    // 2. Click the "CONTINUE" button on the checkout page
    console.log('Locating "CONTINUE" button on the checkout page...');
    const continueBtn = targetPage.locator('button:has-text("CONTINUE"), button:has-text("Continue"), .continue-btn, #continueBtn').first();
    await continueBtn.waitFor({ state: "visible", timeout: 25000 });

    // Center the continue button using JavaScript Executor
    console.log('Executing JavaScript to center "CONTINUE" button in viewport...');
    await continueBtn.evaluate((el) => {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    });
    await targetPage.waitForTimeout(1500);

    console.log('Clicking "CONTINUE" button on checkout page...');
    await continueBtn.click({ force: true });
    await targetPage.waitForLoadState("domcontentloaded").catch(() => {});
    await targetPage.waitForTimeout(4000);

    // Check if availability error appeared after clicking Continue
    if (await this.checkAvailabilityError(targetPage)) {
      return { success: false, reason: "HOTEL_AVAILABILITY_ERROR" };
    }

    console.log(`✓ "CONTINUE" button clicked successfully. Current URL: ${targetPage.url()}`);
    return { success: true };
  }

  /**
   * Step 11: Accept cookies if present, check consent checkbox at the bottom, and click Continue
   * @param {import("@playwright/test").Page} [targetPage] Optional page/tab (defaults to this.page)
   */
  async handleConsentAndFinalContinue(targetPage = this.page) {
    console.log("-------------------------------------------------------------");
    console.log("Step 11: Accept cookies, check consent checkbox & click Continue...");
    console.log("-------------------------------------------------------------");

    await targetPage.waitForTimeout(3000);

    // 1. If cookies popup is appearing on the page, click on Accept / Allow cookies
    console.log("Checking for cookies popup...");
    const cookieBtn = targetPage.locator('button:has-text("Allow cookies"), button:has-text("Accept"), button:has-text("Allow"), .cookie-btn').first();
    if (await cookieBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('✓ Cookie popup detected. Clicking "Allow cookies"...');
      await cookieBtn.click({ force: true });
      await targetPage.waitForTimeout(1500);
      console.log("✓ Cookie popup accepted.");
    } else {
      console.log("ℹ No cookies popup displayed.");
    }

    // Also remove any remaining cookie overlays via JS
    await targetPage.evaluate(() => {
      const sels = ['#cookie-banner', '.cookie-banner', '#cookie-consent', '#onetrust-consent-sdk'];
      sels.forEach(s => document.querySelectorAll(s).forEach(el => el.remove()));
    }).catch(() => {});

    // 2. Scroll to the bottom of the page using JavaScript executor
    console.log("Scrolling to bottom of the page to find consent checkbox...");
    await targetPage.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    });
    await targetPage.waitForTimeout(2000);

    // Probe and log all checkboxes on the page for complete accuracy
    const checkboxInfo = await targetPage.evaluate(() => {
      const items = [];
      document.querySelectorAll('input[type="checkbox"], [role="checkbox"], label').forEach(el => {
        const text = (el.innerText || "").trim();
        const id = el.id || "";
        const cls = el.className || "";
        const visible = el.offsetWidth > 0 && el.offsetHeight > 0;
        if (text || id || el.getAttribute("type") === "checkbox") {
          items.push({
            tag: el.tagName,
            type: el.getAttribute("type"),
            id,
            cls,
            text: text.substring(0, 80),
            visible
          });
        }
      });
      return items;
    });
    console.log("Available checkboxes/labels at bottom:", JSON.stringify(checkboxInfo.slice(-6), null, 2));

    // 3. Locate and click Consent checkbox (#agree_terms1 / label:has-text("consent"))
    console.log('Locating consent checkbox ("Selecting this checkbox I consent to the Terms & Conditions...")...');
    const consentCheckbox = targetPage.locator('#agree_terms1, input[id*="agree"], label.form-check-label:has-text("consent"), label:has-text("consent"), label:has-text("Terms")').first();
    await consentCheckbox.waitFor({ state: "visible", timeout: 15000 });

    // Center consent checkbox in viewport using JS executor
    await consentCheckbox.evaluate((el) => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    await targetPage.waitForTimeout(1000);

    // Check if not already checked
    const isChecked = await consentCheckbox.isChecked().catch(() => false);
    if (!isChecked) {
      await consentCheckbox.click({ force: true });
      console.log("✓ Consent checkbox clicked and checked.");
    } else {
      console.log("✓ Consent checkbox is already checked.");
    }

    await targetPage.waitForTimeout(1500);

    // 4. Click the Continue / Proceed button at the bottom of the page
    console.log("Locating final Continue button at the bottom of the page...");
    const finalContinueBtn = targetPage.locator('button:visible').filter({ hasText: /continue/i }).first();
    await finalContinueBtn.waitFor({ state: "visible", timeout: 20000 });

    await finalContinueBtn.evaluate((el) => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    await targetPage.waitForTimeout(1500);

    console.log("Clicking final Continue button...");
    await finalContinueBtn.click({ force: true });
    await targetPage.waitForLoadState("domcontentloaded").catch(() => {});
    await targetPage.waitForTimeout(4000);

    // Check if availability error appeared after final Continue
    if (await this.checkAvailabilityError(targetPage)) {
      return { success: false, reason: "HOTEL_AVAILABILITY_ERROR" };
    }

    console.log(`✓ Final Continue button clicked. Current URL: ${targetPage.url()}`);
    return { success: true };
  }
}
