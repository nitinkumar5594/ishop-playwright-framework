# 🌐 API Test Suite

This folder contains API automation tests for the iShop application using Playwright's built-in `APIRequestContext` (`request` fixture).

## 📁 Structure
- `api_service.spec.js`: Health checks, endpoint connectivity, latency benchmarking, and response validation.

## 🚀 Execution Commands
```bash
# Run all API tests
npx playwright test tests/api

# Run API tests with list reporter
npx playwright test tests/api --reporter=list

# Run API tests targeting specific environment
ENV=qa npx playwright test tests/api
ENV=uat npx playwright test tests/api
```
