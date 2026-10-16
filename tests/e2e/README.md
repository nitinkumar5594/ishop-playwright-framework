# 🔄 End-to-End (E2E) Test Suite

This folder contains comprehensive end-to-end integration workflows that simulate realistic user journeys across the iShop portal.

## 📁 Structure
- `e2e_booking_journey.spec.js`: Multi-step user journeys across Hotel discovery and Flight reservation.

## 🚀 Execution Commands
```bash
# Run all E2E tests in headless mode
npx playwright test tests/e2e

# Run E2E tests in headed mode (browser visible)
npx playwright test tests/e2e --headed

# Run a specific E2E test
npx playwright test tests/e2e/e2e_booking_journey.spec.js --headed
```
