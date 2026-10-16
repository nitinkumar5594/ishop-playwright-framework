# 🖥️ UI Component & Visual Test Suite

This folder contains UI component validation tests, form checks, responsive layout verifications, and visual sanity tests.

## 📁 Structure
- `ui_components.spec.js`: Header/logo validation, navigation tab toggling, and desktop viewport overlay checks.

## 🚀 Execution Commands
```bash
# Run all UI tests in headless mode
npx playwright test tests/ui

# Run UI tests in headed mode
npx playwright test tests/ui --headed

# Run in Playwright Interactive UI Mode
npm run test:ui
```
