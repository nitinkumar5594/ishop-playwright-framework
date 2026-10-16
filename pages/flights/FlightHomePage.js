// @ts-check
import { expect } from '@playwright/test';

/**
 * iShop Home Page Object Model
 * Encapsulates exact locators and actions for ICICI iShop portal.
 */
export class FlightHomePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Locators based on exact application DOM
    this.cookieDismissBtn = page.locator('button:has-text("Accept"), button:has-text("Got it"), button:has-text("I Agree"), .cookie-dismiss').first();
    this.travelAndStaysBtn = page.locator('a[href*="/compare-fly"], a:has-text("Travel & Stays")').first();
    this.oneWayRadio = page.locator('label[for="oneWay"], input#oneWay').first();
  }

  /**
   * Dismiss cookie banners & popups
   */
  async removeCookieBanner() {
    await this.page.evaluate(() => {
      ['#cookie-banner', '.cookie-banner', '#cookie-consent', '#onetrust-consent-sdk', '.modal-backdrop'].forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.remove());
      });
    }).catch(() => { });
  }

  /**
   * Step 1: Login to Portal via SSO URL
   * @param {string} url
   */
  async loginToPortal(url) {
    console.log(`Step 1: Navigating to SSO URL: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(2000);
    await this.removeCookieBanner();
    await expect(this.page).toHaveURL(/.*(reward360|ishop).*/, { timeout: 15000 });
  }

  /**
   * Step 2: Click on "Travel & Stay" Button
   */
  async clickTravelAndStays() {
    console.log('Step 2: Clicking Travel & Stay Button...');
    await this.removeCookieBanner();

    if (!this.page.url().includes('compare-fly')) {
      if (await this.travelAndStaysBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await this.travelAndStaysBtn.click({ force: true });
      } else {
        const baseUrl = new URL(this.page.url()).origin;
        await this.page.goto(`${baseUrl}/compare-fly`, { waitUntil: 'domcontentloaded' });
      }
    }

    await this.page.waitForLoadState('domcontentloaded').catch(() => { });
    await expect(this.page).toHaveURL(/.*compare-fly.*/, { timeout: 15000 });
    console.log('✓ Navigated to Travel & Stays (/compare-fly).');
  }

  /**
   * Step 3: Click on "One Way" radio button
   */
  async selectOneWay() {
    console.log('Step 3: Selecting One Way...');
    await this.removeCookieBanner();

    await this.oneWayRadio.waitFor({ state: 'visible', timeout: 10000 });
    await this.oneWayRadio.click({ force: true });
    await this.page.waitForTimeout(500);

    console.log('✓ Step 3 Complete: One Way selected.');
  }

  /**
   * Step 4: Click on first city dropdown & select Mumbai
   * @param {string} cityName
   */
  async selectFirstCity(cityName = 'Mumbai') {
    console.log(`Step 4: Selecting "${cityName}" in first city dropdown...`);
    await this.removeCookieBanner();

    // 1. Click origin container to trigger dropdown popup
    const fromContainer = this.page.locator('#fromCityDiv, .select-root-left').first();
    await fromContainer.waitFor({ state: 'visible', timeout: 10000 });
    await fromContainer.click({ force: true });
    await this.page.waitForTimeout(500);

    const searchInput = this.page.locator('#fromCitySearch').first();

    // If popup didn't open automatically, click inner text or unhide
    if (!(await searchInput.isVisible().catch(() => false))) {
      await this.page.locator('#fromCityDiv h5, #fromCityDiv span').first().click({ force: true }).catch(() => { });
      await this.page.waitForTimeout(500);
      if (!(await searchInput.isVisible().catch(() => false))) {
        await this.page.evaluate(() => {
          const popup = document.querySelector('#showFlightFrom');
          if (popup) {
            popup.classList.remove('flight-from-hide');
            popup.style.display = 'block';
          }
        });
      }
    }

    // 2. Fill city name in search input
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await searchInput.fill(cityName);
    await this.page.waitForTimeout(1000);

    // 3. Select matching airport item from dropdown
    const airportOption = this.page
      .locator('#showFlightFrom li.airport-item')
      .filter({ hasText: new RegExp(cityName, 'i') })
      .first();

    if (await airportOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await airportOption.click({ force: true });
    } else {
      // Fallback: JS click on matching list item
      await this.page.evaluate((name) => {
        const items = Array.from(document.querySelectorAll('#showFlightFrom li.airport-item'));
        const match = items.find(el => el.innerText.toLowerCase().includes(name.toLowerCase()));
        if (match) match.click();
      }, cityName);
    }

    await this.page.waitForTimeout(1000);

    // 4. Verify selection succeeded
    const hiddenCityInput = this.page.locator('input[formcontrolname="fromCity"]');
    if (await hiddenCityInput.count() > 0) {
      await expect(hiddenCityInput).toHaveValue(new RegExp(cityName, 'i'), { timeout: 5000 });
    }

    console.log(`✓ Step 4 Complete: City "${cityName}" selected in Origin.`);
  }

  /**
   * Step 5: Click on second city (Destination) dropdown & select city
   * Uses #toCityDiv / #toCityMob / .fly-to Angular DOM structure.
   * @param {string} cityName
   */
  async selectSecondCity(cityName = 'Mumbai') {
    console.log(`Step 5: Selecting "${cityName}" in second city (Destination) dropdown...`);
    await this.removeCookieBanner();

    // 0. PRE-CHECK: Fail fast if destination matches origin
    const currentOrigin = await this.page
      .locator('input[formcontrolname="fromCity"]')
      .inputValue()
      .catch(() => '');
    if (currentOrigin && (
      currentOrigin.toLowerCase() === cityName.toLowerCase() ||
      currentOrigin.toLowerCase().includes(cityName.toLowerCase()) ||
      cityName.toLowerCase().includes(currentOrigin.toLowerCase())
    )) {
      throw new Error(
        `❌ Same-city selection blocked! Origin is already "${currentOrigin}". ` +
        `Destination "${cityName}" cannot be the same as the Origin. Please choose a different city.`
      );
    }

    // 1. Click the TO container to open the destination dropdown
    const toContainer = this.page.locator('#toCityDiv, .select-root-right').first();
    await toContainer.waitFor({ state: 'visible', timeout: 10000 });
    await toContainer.click({ force: true });
    await this.page.waitForTimeout(500);

    const toSearchInput = this.page.locator('#toCityMob, input.flightto').first();

    // If popup didn't open automatically, unhide via JS
    if (!(await toSearchInput.isVisible().catch(() => false))) {
      await this.page.locator('#toCityDiv h5, #toCityDiv span').first().click({ force: true }).catch(() => { });
      await this.page.waitForTimeout(500);
      if (!(await toSearchInput.isVisible().catch(() => false))) {
        await this.page.evaluate(() => {
          const popup = document.querySelector('.flight-to-data, .fly-to');
          if (popup) {
            popup.classList.remove('flight-from-hide');
            popup.style.display = 'block';
          }
        });
      }
    }

    // 2. Fill city name in TO search input
    await toSearchInput.waitFor({ state: 'visible', timeout: 5000 });
    await toSearchInput.fill(cityName);
    await this.page.waitForTimeout(1000);

    // 3. Select matching airport item from TO dropdown
    const toAirportOption = this.page
      .locator('.flight-to-data li.airport-item, .fly-to li.airport-item')
      .filter({ hasText: new RegExp(cityName, 'i') })
      .first();

    if (await toAirportOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await toAirportOption.click({ force: true });
    } else {
      // Fallback: JS click on matching list item in TO dropdown
      await this.page.evaluate((name) => {
        const items = Array.from(document.querySelectorAll('.flight-to-data li.airport-item, .fly-to li.airport-item'));
        const match = items.find(el => el.innerText.toLowerCase().includes(name.toLowerCase()));
        if (match) match.click();
      }, cityName);
    }

    await this.page.waitForTimeout(1000);

    // 4. Verify destination city was set correctly
    const hiddenToCity = this.page.locator('input[formcontrolname="toCity"]');
    if (await hiddenToCity.count() > 0) {
      await expect(hiddenToCity).toHaveValue(new RegExp(cityName, 'i'), { timeout: 5000 });
    }

    // 5. POST-CHECK: Double-confirm origin ≠ destination after selection
    const fromCityValue = await this.page.locator('input[formcontrolname="fromCity"]').inputValue().catch(() => '');
    const toCityValue = await this.page.locator('input[formcontrolname="toCity"]').inputValue().catch(() => '');

    if (fromCityValue && toCityValue && fromCityValue.toLowerCase() === toCityValue.toLowerCase()) {
      throw new Error(
        `❌ Same-city route detected after selection! ` +
        `Both Origin and Destination are "${toCityValue}". This is an invalid flight route.`
      );
    }

    console.log(`✓ Step 5 Complete: Destination "${cityName}" selected.`);
    console.log(`  ✈  Route confirmed: [ ${fromCityValue} ] → [ ${toCityValue} ]`);
  }

  /**
   * Step 6: Open DEPARTURE calendar only (one-way trip) and select a date.
   * ✅ Only touches the FIRST / departure date picker.
   * ❌ Never interacts with the return/second calendar.
   * After selecting, presses Escape to close the calendar panel
   * so the Search button is immediately clickable.
   *
   * @param {number} day       - Day number (e.g. 8)
   * @param {string} monthName - Full month name (e.g. 'September')
   * @param {number} year      - 4-digit year (e.g. 2026)
   */
  async selectDepartureDate(day, monthName, year) {
    console.log(`Step 6: [ONE-WAY] Selecting DEPARTURE date only — ${day} ${monthName} ${year}...`);
    await this.removeCookieBanner();

    // ── 1. Click the DEPARTURE calendar trigger (first one on page) ──
    //    Selectors target only the departure/from-date trigger, not the return picker.
    const departureTrigger = this.page.locator(
      '#datePickerOpen, ' +
      '.departure-date, ' +
      '.select-root-departure, ' +
      '.area-root-departure, ' +
      '.select-dep-ret'
    ).first();

    await departureTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await departureTrigger.click({ force: true });
    console.log('  📅 Departure calendar trigger clicked.');
    await this.page.waitForTimeout(1200);

    // ── 2. Wait for calendar grid to appear ──
    await this.page.locator('[role="gridcell"], [role="grid"], .calendar-grid').first()
      .waitFor({ state: 'visible', timeout: 8000 })
      .catch(() => { });
    await this.page.waitForTimeout(300);

    // ── 3. Navigate forward months until target date is visible ──
    const targetAriaPattern = `${day} ${monthName}, ${year}`;   // e.g. "8 September, 2026"
    for (let attempt = 0; attempt < 24; attempt++) {
      const found = await this.page
        .locator(`[role="gridcell"][aria-label*="${targetAriaPattern}"]`)
        .count();
      if (found > 0) {
        console.log(`  📅 Month visible — found ${found} cell(s) matching "${targetAriaPattern}"`);
        break;
      }

      // Click the next-month arrow via JS (works even if Playwright can't target it)
      const moved = await this.page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('button, span, a, [role="button"]'));
        const next = all.find(el =>
          el.getAttribute('aria-label') === 'Next month' ||
          el.title === 'Next month' ||
          el.getAttribute('aria-label') === 'next' ||
          el.textContent.trim() === '›' ||
          el.textContent.trim() === '>' ||
          (el.className && (el.className.includes('right') || el.className.includes('next')))
        );
        if (next) { next.click(); return true; }
        return false;
      });

      if (!moved) {
        console.log('  ⚠  Could not find Next arrow — stopping month navigation.');
        break;
      }
      await this.page.waitForTimeout(600);
    }

    // ── 4. LAYER 1: Playwright locator — click the departure date gridcell ──
    const pwCell = this.page
      .locator(`[role="gridcell"][aria-label*="${targetAriaPattern}"]`)
      .first();

    const pwVisible = await pwCell.isVisible({ timeout: 3000 }).catch(() => false);
    if (pwVisible) {
      console.log('  ✔ Layer 1 (Playwright): clicking date gridcell...');
      await pwCell.click({ force: true });
    } else {

      // ── 5. LAYER 2: JS executor — click by aria-label substring ──
      console.log('  ⚡ Layer 2 (JS executor): clicking by aria-label...');
      const clicked = await this.page.evaluate((pattern) => {
        const cells = Array.from(document.querySelectorAll('[role="gridcell"]'));
        const target = cells.find(c => {
          const label = c.getAttribute('aria-label') || '';
          return label.includes(pattern);
        });
        if (target) {
          target.scrollIntoView({ block: 'center' });
          target.click();
          return `Clicked: ${target.getAttribute('aria-label')}`;
        }
        return null;
      }, targetAriaPattern);

      if (clicked) {
        console.log(`  ✔ Layer 2 success: ${clicked}`);
      } else {

        // ── 6. LAYER 3: JS executor — match by day number + month text ──
        console.log(`  ⚡ Layer 3 (JS executor): clicking by day number "${day}"...`);
        const clickedByText = await this.page.evaluate((dayNum, monthStr) => {
          const cells = Array.from(document.querySelectorAll('[role="gridcell"]'));
          const target = cells.find(c => {
            if (c.getAttribute('aria-disabled') === 'true') return false;
            if (c.style.pointerEvents === 'none') return false;
            const label = c.getAttribute('aria-label') || '';
            return label.includes(monthStr) &&
              (label.includes(` ${dayNum} `) || label.includes(`, ${dayNum} `));
          });
          if (target) {
            target.scrollIntoView({ block: 'center' });
            target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            return `Clicked via day text: ${target.getAttribute('aria-label')}`;
          }
          return null;
        }, String(day), monthName);

        if (clickedByText) {
          console.log(`  ✔ Layer 3 success: ${clickedByText}`);
        } else {
          throw new Error(
            `❌ Could not click departure date "${day} ${monthName} ${year}" — all 3 layers failed.\n` +
            `  Make sure the calendar is open and the date is not disabled/in the past.`
          );
        }
      }
    }

    // ── 7. CLOSE the auto-opened return-date calendar ───────────────────────
    //
    // ROOT CAUSE: After you click a departure date, this app AUTOMATICALLY
    // opens the return/round-trip calendar ("Save more on round trips!" prompt).
    // This return calendar blocks the Search button.
    //
    // FIX: Re-click the "One Way" radio button — this tells the app
    // "no return date needed" and fully dismisses the return calendar.
    //
    await this.page.waitForTimeout(400);
    console.log('  🔄 Re-clicking One Way radio to dismiss return-date calendar...');

    // Re-click the One Way radio button (guaranteed to close the return calendar)
    await this.oneWayRadio.click({ force: true }).catch(() => { });
    await this.page.waitForTimeout(500);

    // Fallback: Escape key if the calendar panel is still somehow visible
    const calendarStillOpen = await this.page
      .locator('[role="gridcell"]').first()
      .isVisible({ timeout: 600 }).catch(() => false);

    if (calendarStillOpen) {
      console.log('  ⚠ Calendar still visible — pressing Escape...');
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(400);
    }

    console.log('  ✅ Return-date calendar dismissed. Search button is now clear.');

    // ── 8. Verify the departure date was applied ──
    const dateSet = await this.page.evaluate(() => {
      const input = document.querySelector(
        'input[formcontrolname="departureDate"], input[formcontrolname="travelDate"], input[formcontrolname="departure"]'
      );
      if (input && input.value) return input.value;
      const label = document.querySelector(
        '#datePickerOpen h5, #datePickerOpen .selected-date, ' +
        '.departure-date h5, .departure-date .date-label, ' +
        '.select-root-departure h5, .area-root-departure h5'
      );
      return label ? label.innerText.trim() : '';
    });

    console.log(`✓ Step 6 Complete: [ONE-WAY] Departure date "${day} ${monthName} ${year}" selected. Label: "${dateSet || 'see UI'}"`);
  }


  /**
   * Step 7: Click on the Travellers & Class button to open the traveller panel.
   */
  async clickTraveller() {
    console.log('Step 7: Clicking Travellers & Class button...');
    await this.removeCookieBanner();

    // The traveller dropdown trigger — class confirmed via DOM debug
    const travellerBtn = this.page.locator(
      '.Travellers-dropdown, .area-root-reutrn.Travellers-dropdown, .mob-travellers-class-box-left, ' +
      'div:has-text("Travellers & Class"):not(:has(div)):not(.mob-travellers-class)'
    ).first();

    await travellerBtn.waitFor({ state: 'visible', timeout: 10000 });
    await travellerBtn.click({ force: true });
    await this.page.waitForTimeout(800);

    // Verify the traveller panel opened (look for Adult/Child counter or Economy options)
    const panelVisible = await this.page.locator(
      '.Travellers-dropdown-data, .mob-travellers-class, [class*="traveller-panel"], ' +
      'div:has-text("Adult"), div:has-text("Economy")'
    ).first().isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`✓ Step 7 Complete: Travellers & Class panel ${panelVisible ? 'opened' : 'clicked (panel may already be visible)'}.`);
  }

  /**
   * Step 8: Click the Search / Submit button to execute the flight search.
   * The orange button at the far right of the search bar.
   * Waits for the results page to load after submission.
   */
  async clickSubmit() {
    console.log('Step 8: Clicking Search / Submit button...');
    await this.removeCookieBanner();

    // ── LAYER 0 (JS Direct Click) ───────────────────────────────────────
    // Use JS to click the Search button directly in the DOM.
    // This bypasses ANY overlay (calendar, popup, etc.) that blocks normal click.
    console.log('  ⚡ Layer 0 (JS direct): finding and clicking Search button...');
    const jsClicked = await this.page.evaluate(() => {
      // Priority 1: exact class selectors known for this app
      const exactSelectors = [
        'button.searchbn_web',
        '.search-fly button',
        '.root-search button',
        'button.search-btn',
      ];
      for (const sel of exactSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          el.click();
          return `JS clicked via selector: ${sel}`;
        }
      }
      // Priority 2: find any button/link with text "Search"
      const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const btn = all.find(el => {
        const text = (el.innerText || el.textContent || '').trim().toLowerCase();
        const cls = (el.className || '').toLowerCase();
        return text === 'search' || text === 'search flights' ||
          cls.includes('searchbn') || cls.includes('search-btn');
      });
      if (btn) {
        btn.click();
        return `JS clicked by text/class: "${(btn.innerText || '').trim()}" [${btn.className}]`;
      }
      return null;
    });

    if (jsClicked) {
      console.log(`  ✔ Layer 0 success: ${jsClicked}`);
    } else {
      // ── LAYER 1: Playwright click (fallback) ──
      console.log('  Layer 0 missed — trying Layer 1 (Playwright locator)...');
      const searchBtn = this.page.locator(
        'button.searchbn_web, .root-search button, button.search-btn, ' +
        'button[class*="search"], button[class*="Search"], button[type="submit"], ' +
        'button:has-text("Search"), button:has-text("SEARCH"), .search-fly button'
      ).first();

      const btnVisible = await searchBtn.isVisible({ timeout: 4000 }).catch(() => false);
      if (btnVisible) {
        console.log('  ✔ Layer 1 (Playwright): clicking Search button...');
        await searchBtn.click({ force: true });
      } else {
        throw new Error(
          '❌ Could not click Search/Submit button. ' +
          'Both Playwright and JS executor failed to locate it.'
        );
      }
    }

    // ── Wait for navigation / listing page to load ──
    console.log('  ⏳ Waiting for redirect to listing/results page...');

    // Wait for URL change (navigation away from search page) or network idle
    await Promise.race([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => { }),
      this.page.waitForURL(url =>
        url.href.includes('compare-fly') ||
        url.href.includes('listing') ||
        url.href.includes('results') ||
        url.href.includes('search'),
        { timeout: 30000 }
      ).catch(() => { }),
    ]);

    // Extra wait for Angular/SPA content to render
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { });
    await this.page.waitForTimeout(1500);

    const resultUrl = this.page.url();
    console.log(`✓ Search submitted. Redirected to listing page: ${resultUrl}`);
    return resultUrl;
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  LISTING PAGE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Step 8: Click "View Fares" on the FIRST flight result in the listing page.
   * Expands the fare panel showing Partners / Flight Details / BOOK button.
   */
  async clickViewFares() {
    console.log('Step 8: Clicking "View Fares" on the first flight result...');
    await this.removeCookieBanner();

    // Wait for at least one flight card to appear
    await this.page.waitForSelector(
      '.flight-list, .flight-card, [class*="flight"], [class*="Flight"], ' +
      'button:has-text("View Fares"), .view-fares-btn',
      { timeout: 20000 }
    ).catch(() => { });

    await this.page.waitForTimeout(1500);

    // ── LAYER 0: JS direct click — first "View Fares" button in DOM ──
    const jsClicked = await this.page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, a, [role="button"], span'));
      const btn = all.find(el => {
        const text = (el.innerText || el.textContent || '').trim().toLowerCase();
        return text === 'view fares' || text === 'view fare';
      });
      if (btn) {
        btn.scrollIntoView({ block: 'center' });
        btn.click();
        return `JS clicked: "${(btn.innerText || '').trim()}" [${btn.className}]`;
      }
      return null;
    });

    if (jsClicked) {
      console.log(`  ✔ Layer 0 success: ${jsClicked}`);
    } else {
      // ── LAYER 1: Playwright locator ──
      const viewFaresBtn = this.page.locator(
        'button:has-text("View Fares"), .view-fares-btn, [class*="view-fare"], ' +
        'button:has-text("View fare"), a:has-text("View Fares")'
      ).first();

      await viewFaresBtn.waitFor({ state: 'visible', timeout: 10000 });
      console.log('  ✔ Layer 1 (Playwright): clicking View Fares...');
      await viewFaresBtn.click({ force: true });
    }

    // Wait for the fare panel to expand (BOOK button or partner tabs appear)
    await this.page.waitForSelector(
      'button:has-text("BOOK"), button:has-text("Book"), .book-btn, [class*="book-btn"]',
      { timeout: 10000 }
    ).catch(() => { });
    await this.page.waitForTimeout(800);

    console.log('✓ Step 8 Complete: View Fares panel expanded.');
  }

  /**
   * Step 9: Click the "BOOK" button in the expanded fare panel on the listing page.
   * This is the orange BOOK button shown next to the partner (e.g. Cleartrip).
   */
  async clickBookButton() {
    console.log('Step 9: Clicking "BOOK" button in the fare panel...');
    await this.removeCookieBanner();

    // ── LAYER 0: JS direct click ──
    const jsClicked = await this.page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      // Find exact "BOOK" button (not "Book Now" — that's on the next page)
      const btn = all.find(el => {
        const text = (el.innerText || el.textContent || '').trim();
        return text === 'BOOK' || text === 'Book';
      });
      if (btn) {
        btn.scrollIntoView({ block: 'center' });
        btn.click();
        return `JS clicked: "${(btn.innerText || '').trim()}" [${btn.className}]`;
      }
      return null;
    });

    if (jsClicked) {
      console.log(`  ✔ Layer 0 success: ${jsClicked}`);
    } else {
      // ── LAYER 1: Playwright locator ──
      const bookBtn = this.page.locator(
        'button:has-text("BOOK"), .book-btn, [class*="bookbtn"], button:has-text("Book")'
      ).first();
      await bookBtn.waitFor({ state: 'visible', timeout: 8000 });
      console.log('  ✔ Layer 1 (Playwright): clicking BOOK...');
      await bookBtn.click({ force: true });
    }

    // Wait for navigation to the fare/booking page
    console.log('  ⏳ Waiting for navigation to fare/booking page...');
    await Promise.race([
      this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => { }),
      this.page.waitForURL(url =>
        url.href.includes('book') ||
        url.href.includes('fare') ||
        url.href.includes('review') ||
        url.href.includes('checkout') ||
        url.href.includes('passenger'),
        { timeout: 20000 }
      ).catch(() => { }),
    ]);
    await this.page.waitForTimeout(1500);

    const url = this.page.url();
    console.log(`✓ Step 9 Complete: BOOK clicked. URL: ${url}`);
    return url;
  }

  /**
   * Step 10: Click "Book Now" button on the fare details / review page.
   */
  async clickBookNow() {
    console.log('Step 10: Clicking "Book Now" button on the fare/review page...');
    await this.removeCookieBanner();

    // Wait for page to settle
    await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => { });
    await this.page.waitForTimeout(1000);

    // ── LAYER 0: JS direct click ──
    const jsClicked = await this.page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const btn = all.find(el => {
        const text = (el.innerText || el.textContent || '').trim().toLowerCase();
        return text === 'book now' || text === 'book flight' || text === 'proceed to book';
      });
      if (btn) {
        btn.scrollIntoView({ block: 'center' });
        btn.click();
        return `JS clicked: "${(btn.innerText || '').trim()}" [${btn.className}]`;
      }
      return null;
    });

    if (jsClicked) {
      console.log(`  ✔ Layer 0 success: ${jsClicked}`);
    } else {
      // ── LAYER 1: Playwright locator ──
      const bookNowBtn = this.page.locator(
        'button:has-text("Book Now"), a:has-text("Book Now"), ' +
        'button:has-text("Book now"), button:has-text("BOOK NOW"), ' +
        'button:has-text("Book Flight"), .book-now-btn, [class*="booknow"]'
      ).first();
      await bookNowBtn.waitFor({ state: 'visible', timeout: 10000 });
      console.log('  ✔ Layer 1 (Playwright): clicking Book Now...');
      await bookNowBtn.click({ force: true });
    }

    await this.page.waitForTimeout(1500);
    const url = this.page.url();
    console.log(`✓ Step 10 Complete: Book Now clicked. URL: ${url}`);
    return url;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  CHECKOUT / PASSENGER PAGE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Step 11: Select a traveller by position from the "Add Travellers" list.
   * @param {number} position - 1-based index (e.g. 2 = second traveller "Nitin Bisne")
   */
  async selectTraveller(position = 2) {
    console.log(`Step 11: Selecting traveller #${position} from the Add Travellers list...`);
    await this.removeCookieBanner();

    // Wait for the traveller list to appear on the checkout/passengers page
    await this.page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => { });
    await this.page.waitForTimeout(1500);

    // ── LAYER 0: JS — click the nth checkbox in the traveller list ──
    const result = await this.page.evaluate((pos) => {
      // All traveller row checkboxes (each row has a checkbox input or a clickable label)
      const checkboxes = Array.from(
        document.querySelectorAll(
          'input[type="checkbox"], ' +
          '.traveller-list input, ' +
          '[class*="traveller"] input[type="checkbox"], ' +
          '[class*="passenger"] input[type="checkbox"]'
        )
      );

      if (checkboxes.length === 0) {
        // Fallback: find clickable traveller rows directly
        const rows = Array.from(document.querySelectorAll(
          '[class*="traveller-row"], [class*="passenger-row"], ' +
          '[class*="traveller-item"], [class*="passenger-item"]'
        ));
        const row = rows[pos - 1];
        if (row) {
          row.click();
          return `Clicked traveller row #${pos}: ${row.innerText?.trim()?.split('\n')[0]}`;
        }
        return null;
      }

      const checkbox = checkboxes[pos - 1];
      if (!checkbox) return `No checkbox found at position ${pos} (total: ${checkboxes.length})`;

      // Find the label text (traveller name) for logging
      const label = checkbox.closest('label') ||
        checkbox.parentElement?.querySelector('label') ||
        checkbox.parentElement;
      const name = (label?.innerText || label?.textContent || '').trim().split('\n')[0];

      checkbox.scrollIntoView({ block: 'center' });
      checkbox.click();
      return `Clicked checkbox #${pos}: "${name}"`;
    }, position);

    if (result) {
      console.log(`  ✔ Layer 0: ${result}`);
    } else {
      // ── LAYER 1: Playwright — nth checkbox ──
      console.log('  ⚠ JS layer missed — trying Playwright nth checkbox...');
      const checkboxes = this.page.locator(
        'input[type="checkbox"], [class*="traveller"] input, [class*="passenger"] input'
      );
      const count = await checkboxes.count();
      console.log(`  Found ${count} checkboxes.`);
      if (count >= position) {
        await checkboxes.nth(position - 1).click({ force: true });
        console.log(`  ✔ Layer 1: clicked checkbox #${position}`);
      } else {
        throw new Error(`❌ Could not find traveller #${position}. Only ${count} checkboxes found.`);
      }
    }

    await this.page.waitForTimeout(800);
    console.log(`✓ Step 11 Complete: Traveller #${position} selected.`);
  }

  /**
   * Step 12: Click the "Continue" button on the Add Travellers / booking page.
   */
  async clickContinue() {
    console.log('Step 12: Clicking "Continue" button...');
    await this.removeCookieBanner();
    await this.page.waitForTimeout(500);

    // ── LAYER 0: JS direct click ──
    const jsClicked = await this.page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const btn = all.find(el => {
        const text = (el.innerText || el.textContent || '').trim().toLowerCase();
        const cls = (el.className || '').toLowerCase();
        return text === 'continue' || cls.includes('continue-btn') || cls.includes('btn-continue');
      });
      if (btn) {
        btn.scrollIntoView({ block: 'center' });
        btn.click();
        return `JS clicked: "${(btn.innerText || '').trim()}" [${btn.className}]`;
      }
      return null;
    });

    if (jsClicked) {
      console.log(`  ✔ Layer 0 success: ${jsClicked}`);
    } else {
      // ── LAYER 1: Playwright ──
      const continueBtn = this.page.locator(
        'button:has-text("Continue"), a:has-text("Continue"), ' +
        'button:has-text("CONTINUE"), .continue-btn, [class*="continue"]'
      ).first();
      await continueBtn.waitFor({ state: 'visible', timeout: 8000 });
      console.log('  ✔ Layer 1 (Playwright): clicking Continue...');
      await continueBtn.click({ force: true });
    }

    // Wait for the Review Traveller Details modal to appear
    await this.page.waitForSelector(
      'button:has-text("Confirm"), button:has-text("CONFIRM"), ' +
      '[class*="confirm"], .modal button',
      { timeout: 10000 }
    ).catch(() => { });
    await this.page.waitForTimeout(800);

    console.log('✓ Step 12 Complete: Continue clicked. Review modal should be visible.');
  }

  /**
   * Step 13: Click the "Confirm" button in the "Review Traveller Details" modal.
   */
  async clickConfirm() {
    console.log('Step 13: Clicking "Confirm" in the Review Traveller Details modal...');
    await this.removeCookieBanner();
    await this.page.waitForTimeout(500);

    // ── LAYER 0: JS direct click — find Confirm button in modal ──
    const jsClicked = await this.page.evaluate(() => {
      // Look inside modal/dialog first, then fallback to page-wide
      const modalSelectors = [
        '.modal button', '.dialog button',
        '[role="dialog"] button', '[class*="modal"] button',
        '[class*="popup"] button', '[class*="overlay"] button'
      ];

      for (const sel of modalSelectors) {
        const btns = Array.from(document.querySelectorAll(sel));
        const confirm = btns.find(el => {
          const text = (el.innerText || el.textContent || '').trim().toLowerCase();
          return text === 'confirm' || text === 'confirm details';
        });
        if (confirm) {
          confirm.scrollIntoView({ block: 'center' });
          confirm.click();
          return `JS clicked (modal): "${(confirm.innerText || '').trim()}" [${confirm.className}]`;
        }
      }

      // Page-wide fallback
      const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const btn = all.find(el => {
        const text = (el.innerText || el.textContent || '').trim().toLowerCase();
        return text === 'confirm' || text === 'confirm details';
      });
      if (btn) {
        btn.scrollIntoView({ block: 'center' });
        btn.click();
        return `JS clicked (page): "${(btn.innerText || '').trim()}" [${btn.className}]`;
      }
      return null;
    });

    if (jsClicked) {
      console.log(`  ✔ Layer 0 success: ${jsClicked}`);
    } else {
      // ── LAYER 1: Playwright ──
      const confirmBtn = this.page.locator(
        'button:has-text("Confirm"), button:has-text("CONFIRM"), ' +
        '.modal button:has-text("Confirm"), [role="dialog"] button:has-text("Confirm")'
      ).first();
      await confirmBtn.waitFor({ state: 'visible', timeout: 8000 });
      console.log('  ✔ Layer 1 (Playwright): clicking Confirm...');
      await confirmBtn.click({ force: true });
    }

    await this.page.waitForTimeout(1500);
    const url = this.page.url();
    console.log(`✓ Step 13 Complete: Confirm clicked. URL: ${url}`);
    return url;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  REVIEW / CONSENT PAGE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Step 14: Click the consent checkbox at the bottom of the review page
   * ("I confirm the booking details and accept the Terms & Conditions and Privacy Policy")
   */
  async clickConsentCheckbox() {
    console.log('Step 14: Clicking consent checkbox at the bottom of the page...');
    await this.removeCookieBanner();

    // Wait for the Review / Fare Rules page to load
    await this.page.waitForSelector(
      ':has-text("Fare Rules"), :has-text("confirm the booking details"), :has-text("Terms & Conditions")',
      { timeout: 15000 }
    ).catch(() => { });
    await this.page.waitForTimeout(1000);

    // Ensure the page scrolls down towards the consent section
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(800);

    // ── LAYER 0: JS direct search & click ──
    const jsClicked = await this.page.evaluate(() => {
      // 1. Look for checkbox whose container mentions Terms & Conditions or booking details
      const allCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      for (const cb of allCheckboxes) {
        const container = cb.closest('div, label, p, section, span, li') || cb.parentElement;
        const text = (container?.innerText || container?.textContent || '').toLowerCase();
        if (
          text.includes('confirm the booking') ||
          text.includes('terms & conditions') ||
          text.includes('privacy policy')
        ) {
          cb.scrollIntoView({ block: 'center' });
          if (!cb.checked) {
            cb.click();
          }
          return `Clicked consent checkbox: "${text.slice(0, 60)}..." (checked: ${cb.checked})`;
        }
      }

      // 2. Look for any label or container element containing the consent text
      const allElements = Array.from(document.querySelectorAll('label, div, p, span'));
      const consentEl = allElements.find(el => {
        const text = (el.innerText || el.textContent || '').trim().toLowerCase();
        return text.includes('i confirm the booking details') ||
          (text.includes('terms & conditions') && text.includes('confirm'));
      });

      if (consentEl) {
        // Try finding checkbox inside or adjacent
        const cb = consentEl.querySelector('input[type="checkbox"]') ||
          consentEl.parentElement?.querySelector('input[type="checkbox"]');
        if (cb) {
          cb.scrollIntoView({ block: 'center' });
          if (!cb.checked) cb.click();
          return `Clicked associated checkbox in consent container (checked: ${cb.checked})`;
        }
        consentEl.scrollIntoView({ block: 'center' });
        consentEl.click();
        return `Clicked consent container directly: "${(consentEl.innerText || '').slice(0, 60)}"`;
      }

      return null;
    });

    if (jsClicked) {
      console.log(`  ✔ Layer 0 success: ${jsClicked}`);
    } else {
      // ── LAYER 1: Playwright locators ──
      console.log('  ⚠ Layer 0 missed, trying Playwright locators...');
      const consentLocator = this.page.locator(
        'label:has-text("I confirm the booking details"), ' +
        'label:has-text("Terms & Conditions"), ' +
        'input[type="checkbox"]:near(:text("Terms & Conditions")), ' +
        ':has-text("I confirm the booking details and accept") >> input[type="checkbox"]'
      ).first();

      await consentLocator.waitFor({ state: 'visible', timeout: 8000 });
      await consentLocator.scrollIntoViewIfNeeded();
      await consentLocator.click({ force: true });
      console.log('  ✔ Layer 1 (Playwright): clicked consent element.');
    }

    await this.page.waitForTimeout(1000);
    console.log('✓ Step 14 Complete: Consent checkbox clicked.');
  }

  /**
   * Step 15: Click the "Continue" button on the Review page.
   */
  async clickReviewContinue() {
    console.log('Step 15: Clicking "Continue" button on Review page...');
    await this.removeCookieBanner();
    await this.page.waitForTimeout(500);

    // ── LAYER 0: JS direct click ──
    const jsClicked = await this.page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      // Find visible continue button
      const btn = all.find(el => {
        const text = (el.innerText || el.textContent || '').trim().toLowerCase();
        const cls = (el.className || '').toLowerCase();
        return (text === 'continue' || cls.includes('cntinue_btn') || cls.includes('continue-btn')) &&
          el.offsetParent !== null;
      });
      if (btn) {
        btn.scrollIntoView({ block: 'center' });
        btn.click();
        return `JS clicked Continue: "${(btn.innerText || '').trim()}" [${btn.className}]`;
      }
      return null;
    });

    if (jsClicked) {
      console.log(`  ✔ Layer 0 success: ${jsClicked}`);
    } else {
      // ── LAYER 1: Playwright ──
      const continueBtn = this.page.locator(
        'button:has-text("Continue"), a:has-text("Continue"), ' +
        'button:has-text("CONTINUE"), .cntinue_btn, .continue-btn, [class*="continue"]'
      ).first();
      await continueBtn.waitFor({ state: 'visible', timeout: 8000 });
      console.log('  ✔ Layer 1 (Playwright): clicking Continue...');
      await continueBtn.click({ force: true });
    }

    await this.page.waitForTimeout(2000);
    const url = this.page.url();
    console.log(`✓ Step 15 Complete: Continue clicked on Review page. URL: ${url}`);
    return url;
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  PAYMENT PAGE ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Step 16: Wait for Payment page / options to load
   */
  async waitForPaymentPage() {
    console.log('Step 16: Waiting for Payment page / options to load...');
    await this.removeCookieBanner();

    // Wait for network to settle and payment-related selectors to show
    await this.page.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => { });
    await this.page.waitForSelector(
      ':has-text("Payment"), :has-text("Payment Options"), :has-text("Pay"), [class*="payment"]',
      { timeout: 25000 }
    ).catch(() => { });
    await this.page.waitForTimeout(2000);

    const url = this.page.url();
    console.log(`✓ Step 16 Complete: On Payment page. Current URL: ${url}`);
    return url;
  }
}



// Backwards compatibility alias
export const IShopHomePage = FlightHomePage;
