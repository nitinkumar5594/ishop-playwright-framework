// @ts-check
import { jiraLogger } from './JiraBugLogger.js';

async function main() {
  console.log('Testing Jira Connection...');
  console.log('Host   :', jiraLogger.config.host);
  console.log('Email  :', jiraLogger.config.email);
  console.log('Project:', jiraLogger.config.projectKey);

  const result = await jiraLogger.testConnection();
  if (result.success) {
    console.log('✅ Connection Successful! Logged in as:', result.user);
  } else {
    console.log('❌ Connection Failed:', result.message || `HTTP ${result.status}`);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Verify your Atlassian account email address.');
    console.log('2. Ensure the API Token was generated at https://id.atlassian.com/manage-profile/security/api-tokens');
    console.log('3. Ensure your account has access to project:', jiraLogger.config.projectKey);
  }
}

main();
