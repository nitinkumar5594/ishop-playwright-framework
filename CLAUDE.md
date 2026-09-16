# iShop Playwright Automation Guidelines

## Target Portal
- **Base URL**: `https://ishop-qa.reward360.in/`
- **Application**: Reward360 iShop (Hotels, Flights, Stays)

## Test Execution Commands
- **Run Hotel Tests (Headed / Watch Live)**: `npm run test:hotel:e2e`
- **Run Hotel Tests (Headless / Fast)**: `npx playwright test tests/hotels/ --project=chromium`
- **Run Flight Tests**: `npm run test:flight:e2e`
- **Run All Tests**: `npm test`
- **Interactive UI**: `npm run test:ui`
- **View HTML Report**: `npm run test:report`

## Key Architecture
- **Page Objects**: `pages/hotels/HotelHomePage.js`, `pages/flights/FlightHomePage.js`
- **Configs**: `config/hotels/environment.js`, `config/flights/environment.js`
- **Reporters**: Dedicated standalone HTML report per script run in `reports/` + Playwright HTML in `playwright-report/` + JSON in `test-results/`.
