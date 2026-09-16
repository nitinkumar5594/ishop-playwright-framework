# 🐞 Automated Jira Bug Logging Integration

This module allows Playwright test scripts across **Hotels**, **Flights**, and **iShop** to automatically create Jira bugs with **Expected Results**, **Actual Results**, **Failure Screenshots**, and **Diagnostic Logs** whenever a test fails.

---

## 📋 Information Required from Jira

To connect your Playwright framework to Jira, you only need **4 details**:

| # | Information | Description | Example |
|---|---|---|---|
| **1** | **Jira Host URL** | Base URL of your company's Jira Cloud or Server | `https://reward360.atlassian.net` |
| **2** | **Jira User Email** | Email ID associated with your Jira account | `nitinkumar.b@reward360.in` |
| **3** | **Jira API Token** | Secret API token generated from your Atlassian account | *(See steps below)* |
| **4** | **Project Key** | The 2–5 letter code of your Jira project | `ISHOP` or `HOTEL` or `QA` |

---

## 🔑 How to Generate a Jira API Token (2 minutes)
1. Go to: **[https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)**
2. Click **Create API token**.
3. Label it: `Playwright-Automation`.
4. Click **Create** and copy the token.
5. Paste it in [`jira/jira.config.js`](./jira.config.js).

---

## 🚀 How to Enable

In [`jira/jira.config.js`](./jira.config.js), fill in your credentials and change `enabled: false` to `enabled: true`:

```javascript
export const JIRA_CONFIG = {
  enabled: true, // <-- set to true
  host: 'https://reward360.atlassian.net',
  email: 'nitinkumar.b@reward360.in',
  apiToken: 'YOUR_COPIED_API_TOKEN',
  projectKey: 'ISHOP',
  issueType: 'Bug',
  preventDuplicates: true, // Prevents creating duplicate tickets if already logged
};
```

---

## 💡 How to Use in Any Test (Hotels / Flights / iShop)

In any test `catch` block (or directly inside `ScriptReporter.js`):

```javascript
import { jiraLogger } from '../../jira/JiraBugLogger.js';

try {
  // Test actions...
} catch (error) {
  // Automatically logs bug in Jira
  await jiraLogger.logBug({
    title: 'Select Room failed on Hotel Checkout',
    feature: 'Hotels', // 'Hotels' | 'Flights' | 'iShop'
    testFile: 'tests/hotels/hotel_booking_flow.spec.js',
    step: 'Step 5: Select Room',
    expected: 'Room should be selected and user proceeds to checkout',
    actual: 'Select Room button was not clickable or returned 500 error',
    error: error,
    pageUrl: page.url(),
    screenshotPath: 'reports/screenshots/failure.png' // optional
  });

  throw error;
}
```

---

## 🛡️ Safety Guarantee
- **Non-blocking**: If Jira is unreachable or credentials are missing, tests will **never fail or crash** because of Jira.
- **Zero Impact on Existing Code**: By default `enabled: false` ensures normal test runs are completely unaffected until you decide to enable it.
- **Duplicate Prevention**: If an open bug already exists with the same title, it logs the existing issue link without creating duplicate tickets.
