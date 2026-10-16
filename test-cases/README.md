# 🧪 iShop Playwright Automation - Test Cases Registry

Automated test repository and live execution counter for **Hotels** and **Flights**.

> [!NOTE]
> This registry is **self-updating**: every time an automated Playwright test executes, the execution count increments automatically (`executionCount++`), status is updated, and this documentation is regenerated.

## 📊 Live Execution Metrics

| Category | Total Test Cases | Total Executions | Passed | Failed | Pass Rate |
|---|---|---|---|---|---|
| **Overall Suite** | **28** | **20** | **12** | **8** | **60.0%** |
| 🏨 **Hotels - Positive** | 8 | - | - | - | - |
| 🏨 **Hotels - Negative** | 6 | - | - | - | - |
| ✈️ **Flights - Positive** | 8 | - | - | - | - |
| ✈️ **Flights - Negative** | 6 | - | - | - | - |

---

## 📁 Test Case Suites

### 🏨 Hotels
- **[Positive Test Cases (8)](./hotels/positive_test_cases.md)**: Search, date selection (15th - 16th Oct), rooms/guests, hotel listing, room selection, policy acceptance, checkout consent.
- **[Negative Test Cases (6)](./hotels/negative_test_cases.md)**: Empty destination, invalid city, disabled past dates, check-out before check-in, room sold-out recovery, missing consent validation.

### ✈️ Flights
- **[Positive Test Cases (8)](./flights/positive_test_cases.md)**: One-way valid search (DEL-BOM), calendar date selection, passenger & cabin configuration, flight listing, fare selection, round-trip search, traveler details entry.
- **[Negative Test Cases (6)](./flights/negative_test_cases.md)**: Same origin and destination, empty search fields, infant count exceeding adults, past date selection, return date earlier than departure, invalid contact formatting.

---

## 🚀 Execution & Tracking Commands

```bash
# View Live Test Case Summary & Execution Counts
npm run test:cases:summary

# Run Positive Hotel Flow (Headed)
npm run test:hotel:preprod

# Run Negative Hotel Validations
npm run test:hotel:negative

# Run Positive Flight Flow (Headed)
npm run test:flight:preprod

# Run Negative Flight Validations
npm run test:flight:negative
```
