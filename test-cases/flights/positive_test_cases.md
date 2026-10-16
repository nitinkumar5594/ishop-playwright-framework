# 📋 Flights - Positive Test Cases

> **Auto-Updated**: 9/23/2026, 2:12:17 PM
> **Total Cases**: 8

## Summary Matrix

| Test Case ID | Title | Severity | Total Runs | Last Status | Last Executed |
|---|---|---|---|---|---|
| **[TC_FLIGHT_POS_001](#tc-flight-pos-001)** | Verify One-Way Flight Search with Valid Origin and Destination | `BLOCKER` | **0** | ⚪ NOT RUN | - |
| **[TC_FLIGHT_POS_002](#tc-flight-pos-002)** | Verify Flight Departure Date Selection from Calendar | `CRITICAL` | **0** | ⚪ NOT RUN | - |
| **[TC_FLIGHT_POS_003](#tc-flight-pos-003)** | Verify Passenger Count and Cabin Class Selection | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_FLIGHT_POS_004](#tc-flight-pos-004)** | Verify Flight Search Execution and Results Listing | `BLOCKER` | **0** | ⚪ NOT RUN | - |
| **[TC_FLIGHT_POS_005](#tc-flight-pos-005)** | Verify Flight Filtering by Stops and Airlines | `MEDIUM` | **0** | ⚪ NOT RUN | - |
| **[TC_FLIGHT_POS_006](#tc-flight-pos-006)** | Verify Flight Fare Selection (Book Now) | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_FLIGHT_POS_007](#tc-flight-pos-007)** | Verify Round-Trip Flight Search with Return Date | `HIGH` | **0** | ⚪ NOT RUN | - |
| **[TC_FLIGHT_POS_008](#tc-flight-pos-008)** | Verify Passenger Details Entry on Flight Itinerary Page | `CRITICAL` | **0** | ⚪ NOT RUN | - |

---

## Detailed Test Cases

### 1. <a id="tc-flight-pos-001"></a>TC_FLIGHT_POS_001: Verify One-Way Flight Search with Valid Origin and Destination

- **Module**: `FLIGHTS` | **Category**: `POSITIVE` | **Severity**: `BLOCKER`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: User is on Flights page (/compare-fly)
- **Description**: Select One-Way radio, enter Origin (DEL) and Destination (BOM) airports.

**Test Steps**:
1. Select 'One Way' trip type
2. Enter origin city 'Delhi' and select 'DEL - Indira Gandhi Intl'
3. Enter destination city 'Mumbai' and select 'BOM - Chhatrapati Shivaji Intl'

**Expected Result**:
> Both sectors populate airport codes DEL and BOM accurately.

---

### 2. <a id="tc-flight-pos-002"></a>TC_FLIGHT_POS_002: Verify Flight Departure Date Selection from Calendar

- **Module**: `FLIGHTS` | **Category**: `POSITIVE` | **Severity**: `CRITICAL`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Origin and destination are selected
- **Description**: Select valid future departure date and dismiss any auto-opened return calendar.

**Test Steps**:
1. Click Departure calendar trigger
2. Navigate to target month
3. Click valid date gridcell
4. Ensure return calendar overlay is dismissed

**Expected Result**:
> Departure date is set and search button is clickable without overlay blocking.

---

### 3. <a id="tc-flight-pos-003"></a>TC_FLIGHT_POS_003: Verify Passenger Count and Cabin Class Selection

- **Module**: `FLIGHTS` | **Category**: `POSITIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Flights search form is displayed
- **Description**: Configure travelers (Adults, Children, Infants) and Cabin Class (Economy/Business).

**Test Steps**:
1. Open Travelers & Cabin selector
2. Set adults count to 1 and cabin class to Economy
3. Click Apply

**Expected Result**:
> Traveler summary reflects '1 Adult, Economy'.

---

### 4. <a id="tc-flight-pos-004"></a>TC_FLIGHT_POS_004: Verify Flight Search Execution and Results Listing

- **Module**: `FLIGHTS` | **Category**: `POSITIVE` | **Severity**: `BLOCKER`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: All flight search parameters are filled
- **Description**: Click Search Flights button and verify results are rendered on listing page.

**Test Steps**:
1. Click 'Search Flights' button
2. Wait for flight listing page navigation
3. Verify flight cards display with price, duration, and stops

**Expected Result**:
> Flight search results are rendered with available airlines (IndiGo, Air India, etc.).

---

### 5. <a id="tc-flight-pos-005"></a>TC_FLIGHT_POS_005: Verify Flight Filtering by Stops and Airlines

- **Module**: `FLIGHTS` | **Category**: `POSITIVE` | **Severity**: `MEDIUM`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Flight listing results are displayed
- **Description**: Apply filter (e.g. Non-Stop only) and verify results reflect filter.

**Test Steps**:
1. Click 'Non-Stop' checkbox under Stops filter
2. Verify listing updates

**Expected Result**:
> Only non-stop flights are shown in the listing results.

---

### 6. <a id="tc-flight-pos-006"></a>TC_FLIGHT_POS_006: Verify Flight Fare Selection (Book Now)

- **Module**: `FLIGHTS` | **Category**: `POSITIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Flight listing is loaded
- **Description**: Select fare option on first available flight card and proceed.

**Test Steps**:
1. Center flight card in viewport
2. Click 'Book Now' / 'View Fares'
3. Select Standard / Saver Fare

**Expected Result**:
> Navigates to flight review / itinerary page.

---

### 7. <a id="tc-flight-pos-007"></a>TC_FLIGHT_POS_007: Verify Round-Trip Flight Search with Return Date

- **Module**: `FLIGHTS` | **Category**: `POSITIVE` | **Severity**: `HIGH`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: Flights search form is displayed
- **Description**: Select Round-Trip option and set valid departure and return dates.

**Test Steps**:
1. Click 'Round Trip' radio button
2. Select Departure date
3. Select Return date after departure date
4. Click Search Flights

**Expected Result**:
> Search executes for both outbound and inbound flight journeys.

---

### 8. <a id="tc-flight-pos-008"></a>TC_FLIGHT_POS_008: Verify Passenger Details Entry on Flight Itinerary Page

- **Module**: `FLIGHTS` | **Category**: `POSITIVE` | **Severity**: `CRITICAL`
- **Execution Statistics**: Total Runs: **0** (Passed: 0, Failed: 0) | Status: **⚪ NOT RUN**
- **Pre-conditions**: On Flight Itinerary / Checkout page
- **Description**: Enter valid primary passenger information (Title, First Name, Last Name, Email, Mobile).

**Test Steps**:
1. Fill Title, First Name, Last Name
2. Fill valid Email Address and Mobile Number
3. Click Continue to Addons / Payment

**Expected Result**:
> Passenger details accepted without validation errors.

---

