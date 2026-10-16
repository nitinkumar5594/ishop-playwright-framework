# 🚀 iShop Playwright Automation Framework

Comprehensive end-to-end test automation framework built with **Playwright** and **JavaScript (ES Modules)** for the **Reward360 iShop** platform covering both **Hotels** and **Flights** modules across multiple environments.

---

## 📌 Table of Contents
- [Overview & Architecture](#-overview--architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Prerequisites & Installation](#-prerequisites--installation)
- [Test Execution Commands](#-test-execution-commands)
- [Multi-Environment Configuration](#-multi-environment-configuration)
- [Test Suites & Coverage](#-test-suites--coverage)
  - [🏨 Hotel Automation](#-hotel-automation)
  - [✈️ Flight Automation](#️-flight-automation)
- [Test Cases Registry & Live Tracking](#-test-cases-registry--live-tracking)
- [Reporting System](#-reporting-system)
- [Jira Bug Logging Integration](#-jira-bug-logging-integration)
- [Playwright Configuration Highlights](#-playwright-configuration-highlights)

---

## 🏗 Overview & Architecture

This framework follows the **Page Object Model (POM)** design pattern with clean separation of concerns:

- **Target Application**: [iShop QA Portal](https://ishop-qa.reward360.in/) (also supports UAT, Pre-prod, and Production)
- **Framework Type**: Playwright Test Runner with ES Modules (`"type": "module"`)
- **Key Capabilities**:
  - Robust UI interactions for complex multi-step search, filter, selection, and checkout flows.
  - Multi-environment switching (`qa`, `uat`, `preprod`, `prod`).
  - Desktop 1920×1080 viewport enforcement to prevent responsive portrait-mode overlays.
  - Automatic test case registry updating (`test-cases/`) with live execution metrics.
  - Dedicated standalone HTML step-by-step reports with screenshots alongside standard Playwright reports.
  - Automatic Jira bug logger capturing stack traces, screenshots, and system metadata upon test failure.

---

## 📁 Project Directory Structure

```plaintext
├── config/                         # Environment & application configurations
│   ├── environment.js              # Base environment settings
│   ├── select-env.js               # Interactive CLI environment selector
│   ├── flights/                    # Flight-specific URLs and credentials
│   │   └── environment.js
│   ├── hotels/                     # Hotel-specific URLs and credentials
│   │   └── environment.js
│   └── ishop/                      # Core iShop configuration
│       └── environment.js
├── locators/                       # Element locator definitions
│   └── hotels/
│       └── hotelLocators.js
├── pages/                          # Page Object Model (POM) classes
│   ├── flights/
│   │   └── FlightHomePage.js       # Complete Flight search & booking page actions
│   ├── hotels/
│   │   └── HotelHomePage.js        # Complete Hotel search & booking page actions
│   └── ishop/
│       ├── FlightHomePage.js
│       ├── HotelHomePage.js
│       └── IShopHomePage.js
├── tests/                          # Test specifications
│   ├── api/                        # API test suite (endpoints, health, latency)
│   │   ├── README.md
│   │   └── api_service.spec.js
│   ├── e2e/                        # End-to-end multi-module booking flows
│   │   ├── README.md
│   │   └── e2e_booking_journey.spec.js
│   ├── ui/                         # UI components & visual validation tests
│   │   ├── README.md
│   │   └── ui_components.spec.js
│   ├── data/                       # Shared test data & user profiles
│   │   └── users.json
│   ├── flights/
│   │   ├── flight_booking_flow.spec.js     # E2E positive flight booking flow
│   │   └── flight_negative_tests.spec.js   # Flight validation & edge case tests
│   └── hotels/
│       ├── hotel_booking_flow.spec.js      # E2E positive hotel booking flow
│       └── hotel_negative_tests.spec.js    # Hotel validation & edge case tests
├── test-cases/                     # Automated test case registry & tracker
│   ├── README.md                   # Test case registry overview & live metrics
│   ├── TestCaseTracker.js          # Execution tracker & registry synchronizer
│   ├── test_cases_registry.json    # JSON registry database with execution counts
│   ├── flights/                    # Markdown specifications for flight test cases
│   └── hotels/                     # Markdown specifications for hotel test cases
├── test-data/                      # Test input datasets (JSON)
│   └── hotels.json
├── specs/                          # High-level business & functional specs
│   ├── README.md
│   ├── flight_booking_flow.md
│   └── hotel_booking_flow.md
├── jira/                           # Jira automated defect logging
│   ├── JiraBugLogger.js            # Defect creator with screenshot & log attachments
│   ├── jira.config.js              # Jira host, auth token, and project settings
│   ├── README.md                   # Jira setup guide
│   └── test-jira.js                # Connectivity test script
├── utils/                          # Utility helpers & reporters
│   └── reporter/
│       └── ScriptReporter.js       # Custom standalone HTML execution reporter
├── reports/                        # Custom standalone HTML test reports generated per run
├── playwright-report/              # Playwright HTML test report
├── test-results/                   # Test execution artifacts (traces, videos, screenshots, results.json)
├── playwright.config.js            # Playwright global configuration
├── package.json                    # Project dependencies & npm scripts
└── README.md                       # Main framework documentation
```

---

## ⚙️ Prerequisites & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
Clone the repository and install all required dependencies:

```bash
# Install dependencies
npm install

# Install Playwright browser binaries (Chromium)
npx playwright install chromium
```

---

## 🚀 Test Execution Commands

All commands can be executed via `npm run`:

### 🏨 Hotel Tests
| Command | Description |
|---|---|
| `npm run test:hotel` | Run positive hotel E2E flow (Headed, Chromium) |
| `npm run test:hotel:headless` | Run hotel tests in headless mode |
| `npm run test:hotel:uat` | Run hotel tests against UAT environment |
| `npm run test:hotel:preprod` | Run hotel tests against Pre-prod environment |
| `npm run test:hotel:prod` | Run hotel tests against Production environment |
| `npm run test:hotel:negative` | Run hotel negative validation test suite |

### ✈️ Flight Tests
| Command | Description |
|---|---|
| `npm run test:flight` | Run positive flight E2E flow (Headed, Chromium) |
| `npm run test:flight:uat` | Run flight tests against UAT environment |
| `npm run test:flight:preprod` | Run flight tests against Pre-prod environment |
| `npm run test:flight:prod` | Run flight tests against Production environment |
| `npm run test:flight:negative` | Run flight negative validation test suite |

### 🧪 Modular Suites (API, E2E, UI) & Utilities
| Command | Description |
|---|---|
| `npm run test:api` | Run Playwright API test suite (endpoint checks, response benchmarks) |
| `npm run test:e2e` | Run end-to-end multi-module booking flows in headed mode |
| `npm run test:ui-suite` | Run UI component, layout & responsiveness validation suite |
| `npm test` | Run entire test suite in parallel |
| `npm run test:negative` | Run both hotel and flight negative test suites |
| `npm run test:ui` | Open interactive Playwright UI mode for debugging |
| `npm run test:report` | Serve and view the latest Playwright HTML report |
| `npm run test:cases:summary` | View live test case registry summary in terminal |
| `npm run test:cases:sync` | Synchronize test case markdown files with registry |
| `npm run test:jira` | Test Jira integration connectivity and authentication |
| `npm run env:select` | Launch interactive CLI prompt to switch environments |

---

## 🌐 Multi-Environment Configuration

The framework supports switching between multiple testing tiers:

```bash
# Option 1: Interactive selector
npm run env:select

# Option 2: Prepending ENV variable to npm command
ENV=uat npm run test:hotel
ENV=preprod npm run test:flight
ENV=prod npm run test:hotel
```

Configuration files reside in `config/`:
- `config/hotels/environment.js` - Base URL, hotel search destinations, guest configs.
- `config/flights/environment.js` - Base URL, airport codes (DEL, BOM, etc.), traveler presets.
- `config/environment.js` - Default application URLs and portal settings.

---

## 🧪 Test Suites & Coverage

### 🏨 Hotel Automation
- **E2E Flow (`tests/hotels/hotel_booking_flow.spec.js`)**:
  1. Portal Navigation & landing validation.
  2. Hotel tab selection & destination search.
  3. Check-in and check-out date picker selection.
  4. Room & guest counter incrementation.
  5. Search results filtering & hotel card selection.
  6. Room selection & price validation.
  7. Policy confirmation & guest checkout consent.
- **Negative Scenarios (`tests/hotels/hotel_negative_tests.spec.js`)**:
  - Empty destination submission.
  - Invalid / nonexistent destination search.
  - Past date selection prevention.
  - Checkout date before check-in date validation.
  - Sold-out room recovery handling.
  - Missing terms & conditions consent validation.

### ✈️ Flight Automation
- **E2E Flow (`tests/flights/flight_booking_flow.spec.js`)**:
  1. Flight tab navigation.
  2. Trip type selection (One-way / Round-trip).
  3. Origin and destination city/airport selection.
  4. Calendar date picker handling.
  5. Passenger count & travel class selection (Economy / Business).
  6. Flight listing search results & airline filters.
  7. Fare type selection and proceed to traveler details.
- **Negative Scenarios (`tests/flights/flight_negative_tests.spec.js`)**:
  - Same origin and destination validation.
  - Empty search inputs.
  - Infants count exceeding adult passenger count.
  - Past travel date restrictions.
  - Return date before departure date validation.
  - Invalid contact and passenger detail formatting.

---

## 📊 Test Cases Registry & Live Tracking

The framework features an automated, self-updating test case tracking system located in `test-cases/`:

- **Registry Database**: `test-cases/test_cases_registry.json`
- **Total Test Cases**: **28** test cases (14 Hotel, 14 Flight)
- **Automatic Execution Counter**: Each test run increments execution metrics and updates timestamps.
- **Terminal Summary**: Run `npm run test:cases:summary` to view the latest pass/fail status and execution rates.

---

## 📑 Reporting System

The framework provides a 3-tier reporting mechanism:

1. **Custom Standalone HTML Reports (`reports/`)**:
   - Generated dynamically by `utils/reporter/ScriptReporter.js`.
   - Contains step-by-step logs, action timestamps, screenshots of critical steps, and error traces.
2. **Playwright Official HTML Report (`playwright-report/`)**:
   - Interactive report with step timings, DOM snapshots, network calls, and video recordings.
   - Run `npm run test:report` to view in your browser.
3. **Artifacts & Machine-Readable Output (`test-results/`)**:
   - `results.json`: Complete JSON summary for CI/CD integrations.
   - `results.xml`: JUnit format for Jenkins / GitHub Actions test reporting.

---

## 🐞 Jira Bug Logging Integration

Located in `jira/`, the framework can automatically create Jira bug tickets on test failures:

- **Configuration**: Edit `jira/jira.config.js` with your Jira Host, User Email, API Token, and Project Key (`ISHOP`).
- **Features**:
  - Non-blocking (tests won't fail if Jira is unreachable).
  - Duplicate prevention (checks for open tickets before logging a new one).
  - Automatically attaches failure screenshot, expected vs. actual results, step number, and error stack trace.
- **Test Connectivity**:
  ```bash
  npm run test:jira
  ```

---

## 🎯 Playwright Configuration Highlights

In `playwright.config.js`:
- **Viewport**: Fixed at `1920x1080` desktop resolution with `--start-maximized` and `--window-size=1920,1080` launch args to avoid responsive mobile portrait overlays on the iShop portal.
- **Retries**: 2 retries on CI environments (`process.env.CI`), 0 locally.
- **Artifacts**: Trace captured on first retry (`trace: 'on-first-retry'`), screenshot taken on every failure, video retained on failure.
- **Parallelism**: Configured for fully parallel test execution (`fullyParallel: true`).

---

**Author**: Nitin Bisne  
**Project**: Reward360 iShop Playwright Automation Framework
