# 📋 Flights - Negative Test Cases

> **Auto-Updated**: 9/23/2026, 2:12:17 PM
> **Total Cases**: 6

## Summary Matrix

| Test Case ID | Title | Severity | Total Runs | Last Status | Last Executed |
|---|---|---|---|---|---|
| **[TC_FLIGHT_NEG_001](#tc-flight-neg-001)** | Verify Validation when Origin and Destination are Identical | `HIGH` | **9** | ✅ PASSED | 2:12:17 PM |
| **[TC_FLIGHT_NEG_002](#tc-flight-neg-002)** | Verify Validation when Searching with Empty Origin or Destination | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_FLIGHT_NEG_003](#tc-flight-neg-003)** | Verify Infant Count Cannot Exceed Adult Count | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_FLIGHT_NEG_004](#tc-flight-neg-004)** | Verify Past Dates Disabled for Flight Departure | `HIGH` | **3** | ✅ PASSED | 2:12:16 PM |
| **[TC_FLIGHT_NEG_005](#tc-flight-neg-005)** | Verify Return Date cannot be Earlier than Departure Date | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_FLIGHT_NEG_006](#tc-flight-neg-006)** | Verify Validation for Malformed Traveler Email or Mobile | `MEDIUM` | **0** | ⚪ NOT RUN | - |

---

## Detailed Test Cases

### 1. <a id="tc-flight-neg-001"></a>TC_FLIGHT_NEG_001: Verify Validation when Origin and Destination are Identical

- **Module**: `FLIGHTS` | **Category**: `NEGATIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **9** (Passed: 4, Failed: 5) | Status: **🟢 PASSED**
- **Pre-conditions**: Flights search form is open
- **Description**: Select Delhi (DEL) as Origin and Delhi (DEL) as Destination.

**Test Steps**:
1. Select DEL as Origin airport
2. Attempt to select DEL as Destination airport

**Expected Result**:
> Validation error: Origin and destination cannot be identical; search blocked.

---

### 2. <a id="tc-flight-neg-002"></a>TC_FLIGHT_NEG_002: Verify Validation when Searching with Empty Origin or Destination

- **Module**: `FLIGHTS` | **Category**: `NEGATIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Flights search form is displayed
- **Description**: Leave destination blank and attempt to click Search Flights.

**Test Steps**:
1. Leave Destination input blank
2. Click Search Flights button

**Expected Result**:
> Validation error prompts user to select destination airport.

---

### 3. <a id="tc-flight-neg-003"></a>TC_FLIGHT_NEG_003: Verify Infant Count Cannot Exceed Adult Count

- **Module**: `FLIGHTS` | **Category**: `NEGATIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Traveler selection popup is open
- **Description**: Attempt to configure 2 infants with only 1 adult passenger.

**Test Steps**:
1. Set adults count to 1
2. Attempt to increase infants count to 2

**Expected Result**:
> UI restricts infant count to <= adult count or shows aviation regulatory warning.

---

### 4. <a id="tc-flight-neg-004"></a>TC_FLIGHT_NEG_004: Verify Past Dates Disabled for Flight Departure

- **Module**: `FLIGHTS` | **Category**: `NEGATIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **3** (Passed: 2, Failed: 1) | Status: **🟢 PASSED**
- **Pre-conditions**: Departure calendar is open
- **Description**: Inspect departure calendar and verify dates earlier than today are disabled.

**Test Steps**:
1. Inspect cells prior to current date in calendar grid
2. Attempt to click past date

**Expected Result**:
> Past dates have aria-disabled='true' and cannot be selected.

---

### 5. <a id="tc-flight-neg-005"></a>TC_FLIGHT_NEG_005: Verify Return Date cannot be Earlier than Departure Date

- **Module**: `FLIGHTS` | **Category**: `NEGATIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Round Trip selected, departure date set
- **Description**: In Round-Trip mode, verify return date cannot precede departure date.

**Test Steps**:
1. Set departure date (e.g. 20th Oct)
2. Attempt to select return date prior to departure (e.g. 15th Oct)

**Expected Result**:
> Calendar disables dates earlier than departure or resets departure date.

---

### 6. <a id="tc-flight-neg-006"></a>TC_FLIGHT_NEG_006: Verify Validation for Malformed Traveler Email or Mobile

- **Module**: `FLIGHTS` | **Category**: `NEGATIVE` | **Severity**: `MEDIUM`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: On Passenger Details checkout step
- **Description**: Enter invalid email ('abc@@xyz') or invalid mobile ('123') on traveler details form.

**Test Steps**:
1. Enter invalid email string into Email field
2. Enter less than 10 digits in Mobile number field
3. Click Continue

**Expected Result**:
> Inline validation messages show 'Enter valid email' and 'Enter valid 10-digit mobile'.

---

