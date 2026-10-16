# 📋 Hotels - Positive Test Cases

> **Auto-Updated**: 9/23/2026, 2:12:17 PM
> **Total Cases**: 8

## Summary Matrix

| Test Case ID | Title | Severity | Total Runs | Last Status | Last Executed |
|---|---|---|---|---|---|
| **[TC_HOTEL_POS_001](#tc-hotel-pos-001)** | Verify Hotel Destination City Search and Auto-suggestion Selection | `CRITICAL` | **0** | ⚪ NOT RUN | - |
| **[TC_HOTEL_POS_002](#tc-hotel-pos-002)** | Verify Check-in and Check-out Date Selection from Calendar (15th - 16th October) | `CRITICAL` | **0** | ⚪ NOT RUN | - |
| **[TC_HOTEL_POS_003](#tc-hotel-pos-003)** | Verify Room and Guest Configuration Selection | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_HOTEL_POS_004](#tc-hotel-pos-004)** | Verify Hotel Search Results Displayed on Listing Page | `BLOCKER` | **0** | ⚪ NOT RUN | - |
| **[TC_HOTEL_POS_005](#tc-hotel-pos-005)** | Verify Hotel Details Navigation & Book Now Trigger | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_HOTEL_POS_006](#tc-hotel-pos-006)** | Verify Room Selection and Booking Proceed | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_HOTEL_POS_007](#tc-hotel-pos-007)** | Verify Cancellation Policy Modal and Continue Action | `MEDIUM` | **0** | ⚪ NOT RUN | - |
| **[TC_HOTEL_POS_008](#tc-hotel-pos-008)** | Verify Terms & Conditions Consent and Final Checkout | `CRITICAL` | **0** | ⚪ NOT RUN | - |

---

## Detailed Test Cases

### 1. <a id="tc-hotel-pos-001"></a>TC_HOTEL_POS_001: Verify Hotel Destination City Search and Auto-suggestion Selection

- **Module**: `HOTELS` | **Category**: `POSITIVE` | **Severity**: `CRITICAL`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: User is on Hotel Search page (/compare-stay)
- **Description**: User searches for a valid city (e.g. New Delhi, Goa) and selects the auto-suggested option.

**Test Steps**:
1. Navigate to Hotel tab under Travel & Stays
2. Type destination city name into City search input
3. Wait for dropdown suggestions to appear
4. Click on matching destination item

**Expected Result**:
> Selected city is populated into the destination field and suggestion list closes.

---

### 2. <a id="tc-hotel-pos-002"></a>TC_HOTEL_POS_002: Verify Check-in and Check-out Date Selection from Calendar (15th - 16th October)

- **Module**: `HOTELS` | **Category**: `POSITIVE` | **Severity**: `CRITICAL`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Destination city is selected, calendar is visible
- **Description**: User opens the dual-month calendar and selects valid future dates (15th Oct Check-in, 16th Oct Check-out).

**Test Steps**:
1. Click Date picker trigger ('Select Date')
2. Verify October 2026 month is visible or navigate forward
3. Click 15th October gridcell for Check-in
4. Click 16th October gridcell for Check-out

**Expected Result**:
> Check-in shows 15 Oct and Check-out shows 16 Oct in search bar.

---

### 3. <a id="tc-hotel-pos-003"></a>TC_HOTEL_POS_003: Verify Room and Guest Configuration Selection

- **Module**: `HOTELS` | **Category**: `POSITIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: User is on Hotel Search page
- **Description**: User configures valid number of rooms, adults, and child guests.

**Test Steps**:
1. Click on Guests & Rooms selector
2. Adjust adults (e.g. 2 adults) and rooms (1 room)
3. Click Apply / Done button

**Expected Result**:
> Guest summary updates to '2 Guests, 1 Room'.

---

### 4. <a id="tc-hotel-pos-004"></a>TC_HOTEL_POS_004: Verify Hotel Search Results Displayed on Listing Page

- **Module**: `HOTELS` | **Category**: `POSITIVE` | **Severity**: `BLOCKER`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Search parameters (City, Dates, Guests) are filled
- **Description**: Click 'Search' button and confirm hotel cards load with pricing, rating, and facilities.

**Test Steps**:
1. Click 'Search' button
2. Wait for URL transition to /hotels/hotel-list
3. Verify hotel results count and hotel cards display

**Expected Result**:
> Listing page shows available hotels with pricing and 'Book Now' buttons.

---

### 5. <a id="tc-hotel-pos-005"></a>TC_HOTEL_POS_005: Verify Hotel Details Navigation & Book Now Trigger

- **Module**: `HOTELS` | **Category**: `POSITIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Hotels listing page is displayed
- **Description**: Click 'Book Now' on any listed hotel card to open Hotel Details tab/page.

**Test Steps**:
1. Center target hotel card in viewport
2. Click 'Book Now' button on hotel card
3. Switch context if opened in new tab

**Expected Result**:
> Hotel details page loads showing hotel overview and room choices.

---

### 6. <a id="tc-hotel-pos-006"></a>TC_HOTEL_POS_006: Verify Room Selection and Booking Proceed

- **Module**: `HOTELS` | **Category**: `POSITIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Hotel details page is loaded
- **Description**: Click 'Select Room' button and book an available room option.

**Test Steps**:
1. Click 'Select Room' button to scroll to room grid
2. Select room option (e.g. Deluxe Room / Standard)
3. Click 'Book' button on selected room

**Expected Result**:
> Proceeds towards checkout or policy confirmation dialog.

---

### 7. <a id="tc-hotel-pos-007"></a>TC_HOTEL_POS_007: Verify Cancellation Policy Modal and Continue Action

- **Module**: `HOTELS` | **Category**: `POSITIVE` | **Severity**: `MEDIUM`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Room booking button was clicked
- **Description**: Handle cancellation policy dialog if displayed and click Continue.

**Test Steps**:
1. Detect policy modal popup
2. Verify policy text is rendered
3. Click 'CONTINUE' button on modal

**Expected Result**:
> Modal closes and user progresses to guest details / checkout page.

---

### 8. <a id="tc-hotel-pos-008"></a>TC_HOTEL_POS_008: Verify Terms & Conditions Consent and Final Checkout

- **Module**: `HOTELS` | **Category**: `POSITIVE` | **Severity**: `CRITICAL`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: User is on Review/Checkout page
- **Description**: Scroll to bottom of checkout page, check mandatory consent box and proceed.

**Test Steps**:
1. Dismiss any blocking cookie banner
2. Scroll to bottom of checkout page
3. Check mandatory Terms & Conditions consent checkbox
4. Click Continue / Proceed to Payment

**Expected Result**:
> Consent is recorded and user advances to payment gateway.

---

