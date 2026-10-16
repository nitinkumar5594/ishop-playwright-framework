# 📋 Hotels - Negative Test Cases

> **Auto-Updated**: 9/23/2026, 2:12:17 PM
> **Total Cases**: 6

## Summary Matrix

| Test Case ID | Title | Severity | Total Runs | Last Status | Last Executed |
|---|---|---|---|---|---|
| **[TC_HOTEL_NEG_001](#tc-hotel-neg-001)** | Verify Validation when Searching with Empty Destination City | `HIGH` | **7** | ✅ PASSED | 2:09:47 PM |
| **[TC_HOTEL_NEG_002](#tc-hotel-neg-002)** | Verify Error Handling for Invalid / Non-existent Destination City | `MEDIUM` | **0** | ⚪ NOT RUN | - |
| **[TC_HOTEL_NEG_003](#tc-hotel-neg-003)** | Verify Past Dates are Disabled in Calendar | `HIGH` | **1** | ✅ PASSED | 2:09:46 PM |
| **[TC_HOTEL_NEG_004](#tc-hotel-neg-004)** | Verify Check-out Date cannot be Earlier than Check-in Date | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_HOTEL_NEG_005](#tc-hotel-neg-005)** | Verify Error Handling when Hotel / Room becomes Unavailable | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_HOTEL_NEG_006](#tc-hotel-neg-006)** | Verify Validation when Mandatory Consent Checkbox is Unchecked | `HIGH` | **0** | ⚪ NOT RUN | - |

---

## Detailed Test Cases

### 1. <a id="tc-hotel-neg-001"></a>TC_HOTEL_NEG_001: Verify Validation when Searching with Empty Destination City

- **Module**: `HOTELS` | **Category**: `NEGATIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **7** (Passed: 5, Failed: 2) | Status: **🟢 PASSED**
- **Pre-conditions**: Hotel search page is open, city field is cleared
- **Description**: Click search button without entering any destination city.

**Test Steps**:
1. Clear destination city field
2. Click Search Hotels button

**Expected Result**:
> Search is prevented; validation message prompts user to select a city.

---

### 2. <a id="tc-hotel-neg-002"></a>TC_HOTEL_NEG_002: Verify Error Handling for Invalid / Non-existent Destination City

- **Module**: `HOTELS` | **Category**: `NEGATIVE` | **Severity**: `MEDIUM`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: User is on Hotel Search page
- **Description**: Enter gibberish / non-existent city name (e.g. 'XYZABC9999').

**Test Steps**:
1. Type non-existent text in city field
2. Verify dropdown auto-suggestions

**Expected Result**:
> No suggestions found or 'No results' message shown; user cannot select invalid city.

---

### 3. <a id="tc-hotel-neg-003"></a>TC_HOTEL_NEG_003: Verify Past Dates are Disabled in Calendar

- **Module**: `HOTELS` | **Category**: `NEGATIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **1** (Passed: 1, Failed: 0) | Status: **🟢 PASSED**
- **Pre-conditions**: Calendar picker is open
- **Description**: Verify calendar disables dates prior to current date so past booking is impossible.

**Test Steps**:
1. Inspect dates in calendar earlier than today (e.g. 1st September 2026)
2. Attempt to click disabled past date

**Expected Result**:
> Past dates have aria-disabled='true' and cannot be selected.

---

### 4. <a id="tc-hotel-neg-004"></a>TC_HOTEL_NEG_004: Verify Check-out Date cannot be Earlier than Check-in Date

- **Module**: `HOTELS` | **Category**: `NEGATIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Check-in date is selected as 15th October
- **Description**: Attempt to set check-out date prior to check-in date.

**Test Steps**:
1. Select 15th October as check-in
2. Attempt to select 10th October as check-out

**Expected Result**:
> Calendar prevents selection or resets check-in date to the earlier date.

---

### 5. <a id="tc-hotel-neg-005"></a>TC_HOTEL_NEG_005: Verify Error Handling when Hotel / Room becomes Unavailable

- **Module**: `HOTELS` | **Category**: `NEGATIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Attempt to book a room that has 0 availability
- **Description**: Handle supplier sold-out error banner on hotel details or booking page.

**Test Steps**:
1. Trigger room booking
2. Detect availability error modal or banner

**Expected Result**:
> Application shows availability warning and allows rerunning with another hotel/room.

---

### 6. <a id="tc-hotel-neg-006"></a>TC_HOTEL_NEG_006: Verify Validation when Mandatory Consent Checkbox is Unchecked

- **Module**: `HOTELS` | **Category**: `NEGATIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: On Checkout page, consent checkbox is unchecked
- **Description**: Attempt to click Continue on Checkout without accepting Terms & Conditions.

**Test Steps**:
1. Leave consent checkbox unchecked
2. Click Continue to Payment

**Expected Result**:
> Form validation prevents navigation; prompts user to accept Terms & Conditions.

---

