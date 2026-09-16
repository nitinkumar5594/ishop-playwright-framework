// @ts-check
import fs from 'fs';
import path from 'path';
import { JIRA_CONFIG } from './jira.config.js';

/**
 * JiraBugLogger
 * Universal Jira bug logging service for Playwright automation.
 * Formatted to match standard Reward360 / iShop defect templates:
 * [<PROJECT>][<FEATURE>][<DEVICE>]:-<Title>
 */
export class JiraBugLogger {
  constructor(customConfig = {}) {
    this.config = { ...JIRA_CONFIG, ...customConfig };
    // Automatically sanitize host (strip trailing /browse/PROJECT or /)
    if (this.config.host) {
      this.config.host = this.config.host.replace(/\/browse\/.*$/, '').replace(/\/+$/, '');
    }
  }

  /**
   * Builds Basic Auth header for Jira Cloud (email:apiToken)
   */
  _getAuthHeader() {
    if (this.config.apiToken && !this.config.email) {
      return `Bearer ${this.config.apiToken}`;
    }
    const credentials = Buffer.from(`${this.config.email.trim()}:${this.config.apiToken.trim()}`).toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * Verifies Jira connection and returns current user & project access
   */
  async testConnection() {
    try {
      const url = `${this.config.host}/rest/api/2/myself`;
      const response = await fetch(url, {
        headers: {
          'Authorization': this._getAuthHeader(),
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, status: response.status, message: text };
      }

      const user = await response.json();
      return { success: true, user: user.displayName || user.emailAddress };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  /**
   * Search if an open bug with the same title already exists to prevent duplicates
   */
  async findExistingBug(summary) {
    if (!this.config.preventDuplicates) return null;

    try {
      const sanitizedSummary = summary.replace(/["\\]/g, ' ').slice(0, 100);
      const jql = `project = "${this.config.projectKey}" AND issuetype = "${this.config.issueType}" AND statusCategory != Done AND summary ~ "${sanitizedSummary}"`;
      const url = `${this.config.host}/rest/api/2/search?jql=${encodeURIComponent(jql)}&maxResults=1`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this._getAuthHeader(),
          'Accept': 'application/json'
        }
      });

      if (!response.ok) return null;
      const data = await response.json();
      if (data.issues && data.issues.length > 0) {
        return data.issues[0];
      }
    } catch (err) {
      console.warn(`[JiraBugLogger] Duplicate search check skipped:`, err.message);
    }
    return null;
  }

  /**
   * Automatically logs a bug in Jira following standard team format
   * 
   * @param {Object} bugDetails
   * @param {string} bugDetails.title Short bug title / description
   * @param {string} [bugDetails.projectTag] Project tag in title (defaults to projectKey, e.g. 'ISHOP' or 'ICICISHP')
   * @param {string} [bugDetails.feature] Feature area ('HOTEL' | 'FLIGHT' | 'MULTICITY' | 'CHECKOUT')
   * @param {string} [bugDetails.platform] Device / platform ('DESKTOP' | 'MOBILE')
   * @param {string[]} [bugDetails.steps] Array of steps to reproduce
   * @param {string} bugDetails.expected Expected Result
   * @param {string} bugDetails.actual Actual Result
   * @param {Error|string} [bugDetails.error] Error object or message
   * @param {string} [bugDetails.pageUrl] Current browser URL
   * @param {string} [bugDetails.screenshotPath] Path to screenshot for attachment
   * @param {string} [bugDetails.testFile] Name of the failing test file
   * @returns {Promise<{ key: string, url: string } | null>}
   */
  async logBug({
    title,
    projectTag = null,
    feature = 'GENERAL',
    platform = 'DESKTOP',
    steps = [],
    expected = 'Action should execute successfully without UI or functional errors',
    actual = 'Action failed with an error',
    error = null,
    pageUrl = '',
    screenshotPath = null,
    testFile = ''
  }) {
    if (!this.config.enabled) {
      console.log(`[JiraBugLogger] Jira integration disabled. Set JIRA_CONFIG.enabled = true to log bugs automatically.`);
      return null;
    }

    if (!this.config.host || !this.config.apiToken) {
      console.warn(`[JiraBugLogger] Missing host or apiToken in jira.config.js.`);
      return null;
    }

    try {
      const tag = (projectTag || this.config.projectKey || 'ISHOP').toUpperCase();
      const feat = feature.toUpperCase();
      const plat = platform.toUpperCase();

      // Standard Reward360 title format: [PROJECT][FEATURE][PLATFORM]:-<Title>
      const fullSummary = `[${tag}][${feat}][${plat}]:-${title}`.slice(0, 250);

      // Check for duplicates
      const existing = await this.findExistingBug(fullSummary);
      if (existing) {
        const issueUrl = `${this.config.host}/browse/${existing.key}`;
        console.log(`\n================================================================================`);
        console.log(`  [JIRA] Existing Open Bug Found: ${existing.key}`);
        console.log(`  Summary: ${existing.fields?.summary || fullSummary}`);
        console.log(`  URL: ${issueUrl}`);
        console.log(`  Skipping ticket creation to avoid duplicate ticket in Jira.`);
        console.log(`================================================================================\n`);
        return { key: existing.key, url: issueUrl, isDuplicate: true };
      }

      // Format steps list
      let formattedSteps = '';
      if (Array.isArray(steps) && steps.length > 0) {
        formattedSteps = steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n\n');
      } else {
        formattedSteps = `1. Launch the application.\n\n2. Navigate to ${feat} section.\n\n3. Perform booking / search flow.\n\n4. Observe the displayed content and interactions.`;
      }

      const errorMessage = error instanceof Error ? error.message : (error || 'None');
      const errorStack = error instanceof Error ? error.stack : '';

      // Standard Reward360 defect description template
      const description = `
*Steps to Reproduce:*

${formattedSteps}

*Actual Result:*
${actual}

*Expected Result:*
${expected}

----
*Technical Diagnostics:*
* Test File: {{${testFile || 'N/A'}}}
* Landing URL: ${pageUrl || 'N/A'}
* Error: {color:#DE350B}${errorMessage}{color}
${errorStack ? '{code:javascript}\n' + errorStack + '\n{code}' : ''}

_Reported automatically by Playwright Automation Framework_
`.trim();

      // Jira payload
      const payload = {
        fields: {
          project: { key: this.config.projectKey },
          summary: fullSummary,
          description: description,
          issuetype: { name: this.config.issueType },
          labels: [...this.config.labels, feat.toLowerCase(), plat.toLowerCase()]
        }
      };

      const url = `${this.config.host}/rest/api/2/issue`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this._getAuthHeader(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[JiraBugLogger] Failed to create Jira issue (${response.status}):`, errText);
        return null;
      }

      const created = await response.json();
      const issueKey = created.key;
      const issueUrl = `${this.config.host}/browse/${issueKey}`;

      console.log(`\n================================================================================`);
      console.log(`  ✅ JIRA BUG LOGGED AUTOMATICALLY: ${issueKey}`);
      console.log(`  Summary : ${fullSummary}`);
      console.log(`  Link    : ${issueUrl}`);
      console.log(`================================================================================\n`);

      // Attach failure screenshot if available
      if (screenshotPath && fs.existsSync(screenshotPath)) {
        await this.attachScreenshot(issueKey, screenshotPath);
      }

      return { key: issueKey, url: issueUrl };
    } catch (err) {
      console.error(`[JiraBugLogger] Error logging Jira bug:`, err.message);
      return null;
    }
  }

  /**
   * Uploads screenshot to the created Jira issue
   */
  async attachScreenshot(issueKey, filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);

      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: 'image/png' });
      formData.append('file', blob, fileName);

      const url = `${this.config.host}/rest/api/2/issue/${issueKey}/attachments`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': this._getAuthHeader(),
          'X-Atlassian-Token': 'no-check'
        },
        body: formData
      });

      if (response.ok) {
        console.log(`  📎 Attached screenshot to Jira bug: ${fileName}`);
      } else {
        const errText = await response.text();
        console.warn(`  [JiraBugLogger] Screenshot attachment failed: ${errText}`);
      }
    } catch (err) {
      console.warn(`  [JiraBugLogger] Error attaching screenshot:`, err.message);
    }
  }
}

export const jiraLogger = new JiraBugLogger();
