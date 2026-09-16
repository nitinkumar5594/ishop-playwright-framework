// @ts-check
/**
 * JIRA Integration Configuration
 * Configured for Reward360 Atlassian Jira instance
 */

export const JIRA_CONFIG = {
  // Enabled for automatic bug logging
  enabled: true,

  // 1. Jira Base URL (normalized to domain root)
  host: process.env.JIRA_HOST || 'https://lms-rewards360.atlassian.net',

  // 2. Email address associated with your Atlassian account
  email: process.env.JIRA_EMAIL || 'nitinkumar.b@reward360.co',

  // 3. Jira API Token
  apiToken: process.env.JIRA_API_TOKEN || 'ATATT3xFfGF00lnJOK60gmJFoFKuQmdDTHlO7lddSIUmxK7ArGM4nKX41I1vHUTMbGnDoq5a13-B5WYn5ZojHeaeoXvYGI1NfAaT9pKY3tZCODss1ffjr9m3LjqlsT6gOgRBddnQM5oKV56xVnANSdHbEgiFQ-cNiUkklqYYWAjpdvtD5X1HVMw=05437AF1',

  // 4. Jira Project Key (e.g. ICICISHP or ISHOP)
  projectKey: process.env.JIRA_PROJECT_KEY || 'ICICISHP',

  // 5. Issue Type (Standard bug type in your Jira)
  issueType: 'Bug',

  // 6. Default priority
  priority: 'High',

  // 7. Prevent duplicate bugs if an open ticket with same summary already exists
  preventDuplicates: true,

  // 8. Default labels
  labels: ['automation', 'playwright', 'e2e-failure']
};
