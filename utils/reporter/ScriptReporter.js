// @ts-check
import fs from "fs";
import path from "path";
import { testCaseTracker } from "../../test-cases/TestCaseTracker.js";

/**
 * Enhanced Custom Script Reporter
 * - Captures detailed step-by-step logs, warnings, and errors.
 * - Captures browser console errors and unhandled page exceptions.
 * - Generates both an interactive HTML report and a standalone plain-text .log file.
 * - Displays an interactive dark-themed terminal log viewer in the HTML report for instant debugging.
 */
export class ScriptReporter {
  /**
   * @param {string} scriptName Human-readable script name
   * @param {string} scriptPath Relative or absolute path to the spec file
   */
  constructor(scriptName, scriptPath) {
    this.scriptName = scriptName;
    this.scriptPath = scriptPath;
    this.startTime = Date.now();
    this.steps = [];
    this.logs = [];
    this.errors = [];

    // Generate unique timestamp & unique report file paths
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "-");
    const uniqueId = Math.random().toString(36).substring(2, 6);
    const scriptBase = path.basename(scriptPath, path.extname(scriptPath));

    this.reportsDir = path.resolve(process.cwd(), "reports", scriptBase);
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    this.reportFileName = `${scriptBase}_report_${dateStr}_${timeStr}_${uniqueId}.html`;
    this.reportFilePath = path.join(this.reportsDir, this.reportFileName);
    this.relativeReportPath = path.relative(process.cwd(), this.reportFilePath);

    this.logFileName = `${scriptBase}_logs_${dateStr}_${timeStr}_${uniqueId}.log`;
    this.logFilePath = path.join(this.reportsDir, this.logFileName);
    this.relativeLogPath = path.relative(process.cwd(), this.logFilePath);

    this.log(`Reporter initialized for script: ${scriptName} (${scriptPath})`, "INFO");
  }

  /**
   * Print unique header banner in console
   * @param {string} [browser="chromium"]
   */
  printHeader(browser = "chromium") {
    console.log("\n================================================================================");
    console.log(`             ${this.scriptName.toUpperCase()} - EXECUTION STARTED`);
    console.log("================================================================================");
    console.log(`  Script File        : ${this.scriptPath}`);
    console.log(`  Unique Report File : ${this.relativeReportPath}`);
    console.log(`  Execution Log File : ${this.relativeLogPath}`);
    console.log(`  Browser / Device   : ${browser}`);
    console.log(`  Started At         : ${new Date().toLocaleString()}`);
    console.log("================================================================================\n");
  }

  /**
   * Add a timestamped log entry
   * @param {string} message Log message
   * @param {"INFO" | "WARN" | "ERROR" | "DEBUG"} [level="INFO"]
   */
  log(message, level = "INFO") {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { time: timestamp, level, message };
    this.logs.push(entry);

    if (level === "ERROR") {
      this.errors.push({ time: timestamp, message, stack: "" });
    }
  }

  /**
   * Log informational message
   * @param {string} message
   */
  info(message) {
    this.log(message, "INFO");
  }

  /**
   * Log warning message
   * @param {string} message
   */
  warn(message) {
    this.log(message, "WARN");
  }

  /**
   * Log error message with optional Error object
   * @param {string} message
   * @param {Error | null} [err=null]
   */
  error(message, err = null) {
    const timestamp = new Date().toLocaleTimeString();
    const stack = err ? (err.stack || err.message) : "";
    this.logs.push({ time: timestamp, level: "ERROR", message: `${message}${stack ? `\n${stack}` : ""}` });
    this.errors.push({ time: timestamp, message, stack });
  }

  /**
   * Listen to browser page errors and console warnings/errors
   * @param {import("@playwright/test").Page} page
   */
  attachPage(page) {
    if (!page) return;
    page.on("pageerror", (err) => {
      this.warn(`[Browser PageError]: ${err.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        this.log(`[Browser Console Error]: ${msg.text()}`, "ERROR");
      } else if (msg.type() === "warn") {
        this.log(`[Browser Console Warn]: ${msg.text()}`, "WARN");
      }
    });
  }

  /**
   * Record a completed step
   * @param {number} stepNum
   * @param {string} name
   * @param {"PASSED" | "FAILED" | "WARNING" | "INFO"} [status="PASSED"]
   * @param {string} [details=""]
   */
  addStep(stepNum, name, status = "PASSED", details = "") {
    const timestamp = new Date().toLocaleTimeString();
    this.steps.push({
      stepNum,
      name,
      status,
      details,
      time: timestamp
    });
    this.log(`Step ${stepNum} [${status}]: ${name} ${details ? `(${details})` : ""}`, status === "FAILED" ? "ERROR" : status === "WARNING" ? "WARN" : "INFO");
  }

  /**
   * Explicitly link and record a Test Case execution
   * @param {string} testCaseId
   * @param {"PASSED" | "FAILED"} status
   * @param {object} [details={}]
   */
  recordTestCase(testCaseId, status = "PASSED", details = {}) {
    try {
      testCaseTracker.recordExecution(testCaseId, status, {
        title: this.scriptName,
        ...details
      });
    } catch (e) {
      this.warn(`Failed to record test case ${testCaseId}: ${e.message}`);
    }
  }

  /**
   * Generate standalone HTML report & plain-text .log file, then print execution summary
   * @param {"PASSED" | "FAILED" | string} [status="PASSED"]
   * @param {string} [finalUrl=""]
   * @param {Error | string | null} [errorObj=null]
   * @returns {string} Path to generated report file
   */
  finishReport(status = "PASSED", finalUrl = "", errorObj = null) {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const totalSteps = this.steps.length;
    const passedSteps = this.steps.filter(s => s.status === "PASSED").length;
    const isPassed = status.includes("PASSED");

    // Automatically record test execution in TestCaseTracker
    try {
      const p = this.scriptPath.toLowerCase();
      let autoId = null;
      if (p.includes("hotel")) {
        autoId = p.includes("neg") ? "TC_HOTEL_NEG_001" : "TC_HOTEL_POS_004";
      } else if (p.includes("flight")) {
        autoId = p.includes("neg") ? "TC_FLIGHT_NEG_001" : "TC_FLIGHT_POS_004";
      }

      if (autoId) {
        testCaseTracker.recordExecution(autoId, isPassed ? "PASSED" : "FAILED", {
          title: this.scriptName,
          error: errorObj ? (typeof errorObj === "string" ? errorObj : errorObj.message) : null,
          duration: `${duration}s`
        });
      }
    } catch (trackerErr) {
      console.warn("[ScriptReporter] Could not auto-record execution in TestCaseTracker:", trackerErr.message);
    }

    if (errorObj) {
      const errMsg = typeof errorObj === "string" ? errorObj : errorObj.message || String(errorObj);
      const errStack = typeof errorObj === "object" && errorObj.stack ? errorObj.stack : "";
      this.error(`Test finished with error: ${errMsg}`, errorObj instanceof Error ? errorObj : null);
    }

    // 1. Generate Plain-Text .log File
    let rawLogContent = `================================================================================\n`;
    rawLogContent += `  SCRIPT EXECUTION LOG: ${this.scriptName}\n`;
    rawLogContent += `  Target File : ${this.scriptPath}\n`;
    rawLogContent += `  Date / Time : ${new Date().toLocaleString()}\n`;
    rawLogContent += `  Status      : ${status}\n`;
    rawLogContent += `  Duration    : ${duration}s\n`;
    rawLogContent += `  Steps       : ${passedSteps}/${totalSteps} Passed\n`;
    if (finalUrl) rawLogContent += `  Final URL   : ${finalUrl}\n`;
    rawLogContent += `================================================================================\n\n`;

    rawLogContent += `--- [STEPS BREAKDOWN] ---\n`;
    for (const step of this.steps) {
      rawLogContent += `[${step.time}] Step ${step.stepNum}: [${step.status}] ${step.name} - ${step.details || "OK"}\n`;
    }

    rawLogContent += `\n--- [DETAILED EXECUTION & DIAGNOSTIC LOGS] ---\n`;
    for (const log of this.logs) {
      rawLogContent += `[${log.time}] [${log.level.padEnd(5)}] ${log.message}\n`;
    }

    if (this.errors.length > 0) {
      rawLogContent += `\n--- [ERROR STACK TRACES] ---\n`;
      for (const err of this.errors) {
        rawLogContent += `[${err.time}] ERROR: ${err.message}\n${err.stack ? `${err.stack}\n` : ""}\n`;
      }
    }

    fs.writeFileSync(this.logFilePath, rawLogContent, "utf8");

    // 2. Generate Interactive Standalone HTML Report
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${this.scriptName} - Test & Diagnostic Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f8fafc; margin: 0; padding: 24px; }
    .container { max-width: 1040px; margin: 0 auto; background: #151d30; border-radius: 12px; padding: 32px; box-shadow: 0 12px 40px rgba(0,0,0,0.6); border: 1px solid #22324f; }
    h1 { margin: 0 0 20px 0; color: #38bdf8; font-size: 24px; display: flex; align-items: center; justify-content: space-between; }
    .badge { padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .badge-passed { background: #16a34a; color: white; }
    .badge-failed { background: #dc2626; color: white; }
    
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin: 20px 0; background: #0d1526; padding: 18px; border-radius: 8px; border: 1px solid #1e2c47; }
    .meta-item label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px; }
    .meta-item value { font-size: 14px; font-weight: 600; color: #f1f5f9; word-break: break-all; }
    
    .section-title { font-size: 18px; color: #38bdf8; margin: 28px 0 14px 0; display: flex; align-items: center; justify-content: space-between; }
    
    /* Diagnostics Alert */
    .error-box { background: rgba(220, 38, 38, 0.12); border: 1px solid #ef4444; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .error-title { color: #f87171; font-weight: bold; font-size: 15px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .error-stack { background: #050811; color: #fca5a5; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; overflow-x: auto; white-space: pre-wrap; margin: 8px 0 0 0; }

    /* Steps Table */
    .steps-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .steps-table th { text-align: left; padding: 10px 12px; background: #1e2c47; color: #e2e8f0; font-size: 12px; text-transform: uppercase; }
    .steps-table td { padding: 10px 12px; border-bottom: 1px solid #1e2c47; font-size: 13px; }
    .step-ok { color: #4ade80; font-weight: bold; }
    .step-fail { color: #f87171; font-weight: bold; }
    .step-warn { color: #fbbf24; font-weight: bold; }

    /* Terminal Log Viewer */
    .log-container { background: #060913; border: 1px solid #1e2c47; border-radius: 8px; overflow: hidden; margin-top: 14px; }
    .log-header { background: #131c31; padding: 10px 16px; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e2c47; }
    .log-body { padding: 14px; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 12px; line-height: 1.6; max-height: 420px; overflow-y: auto; color: #cbd5e1; }
    .log-line { margin: 3px 0; display: flex; gap: 10px; }
    .log-time { color: #64748b; flex-shrink: 0; }
    .lvl-INFO { color: #38bdf8; font-weight: bold; flex-shrink: 0; width: 50px; }
    .lvl-WARN { color: #fbbf24; font-weight: bold; flex-shrink: 0; width: 50px; }
    .lvl-ERROR { color: #f87171; font-weight: bold; flex-shrink: 0; width: 50px; }
    .log-msg { color: #e2e8f0; word-break: break-word; }

    .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: right; border-top: 1px solid #1e2c47; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>
      <span>${this.scriptName}</span>
      <span class="badge ${isPassed ? "badge-passed" : "badge-failed"}">${status}</span>
    </h1>

    <div class="meta-grid">
      <div class="meta-item"><label>Script Spec</label><value>${this.scriptPath}</value></div>
      <div class="meta-item"><label>Duration</label><value>${duration}s</value></div>
      <div class="meta-item"><label>Steps Passed</label><value>${passedSteps} / ${totalSteps}</value></div>
      <div class="meta-item"><label>Report HTML</label><value>${this.reportFileName}</value></div>
      <div class="meta-item"><label>Diagnostic Log File</label><value>${this.logFileName}</value></div>
    </div>

    ${finalUrl ? `<p style="margin: 14px 0; color: #cbd5e1; font-size: 14px;"><strong>Target Landing URL:</strong> <a href="${finalUrl}" style="color: #38bdf8; text-decoration: none;" target="_blank">${finalUrl}</a></p>` : ""}

    ${this.errors.length > 0 ? `
    <div class="error-box">
      <div class="error-title">⚠️ Issue Diagnosed During Execution:</div>
      ${this.errors.map(err => `
        <div style="font-size: 13px; color: #fecaca; margin-bottom: 6px;"><strong>[${err.time}]</strong> ${err.message}</div>
        ${err.stack ? `<pre class="error-stack">${err.stack}</pre>` : ""}
      `).join("")}
    </div>` : ""}

    <div class="section-title">
      <span>Execution Steps</span>
      <span style="font-size: 12px; color: #94a3b8;">${totalSteps} Steps Recorded</span>
    </div>
    <table class="steps-table">
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>Step Description</th>
          <th style="width: 100px;">Status</th>
          <th>Details</th>
          <th style="width: 90px;">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        ${this.steps.map(s => `
        <tr>
          <td>${s.stepNum}</td>
          <td><strong>${s.name}</strong></td>
          <td class="${s.status === "PASSED" ? "step-ok" : s.status === "WARNING" ? "step-warn" : "step-fail"}">${s.status}</td>
          <td>${s.details || "-"}</td>
          <td style="color: #94a3b8; font-size: 12px;">${s.time}</td>
        </tr>`).join("")}
      </tbody>
    </table>

    <div class="section-title">
      <span>Terminal Execution & Diagnostic Logs</span>
      <span style="font-size: 12px; color: #94a3b8;">Saved in: <code>${this.relativeLogPath}</code></span>
    </div>
    <div class="log-container">
      <div class="log-header">
        <span>Live Trace Console Output</span>
        <span>${this.logs.length} Log Entries</span>
      </div>
      <div class="log-body">
        ${this.logs.map(log => `
        <div class="log-line">
          <span class="log-time">[${log.time}]</span>
          <span class="lvl-${log.level}">[${log.level}]</span>
          <span class="log-msg">${log.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
        </div>`).join("")}
      </div>
    </div>

    <div class="footer">
      Generated by Reward360 Playwright Automation Suite • ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;

    fs.writeFileSync(this.reportFilePath, htmlContent, "utf8");

    console.log("\n================================================================================");
    console.log(`              ${this.scriptName.toUpperCase()} - EXECUTION SUMMARY`);
    console.log("================================================================================");
    console.log(`  Test Status        : ${isPassed ? "PASSED [✓]" : "FAILED [✗]"}`);
    console.log(`  Total Steps        : ${passedSteps} / ${totalSteps} Passed`);
    console.log(`  Duration           : ${duration}s`);
    console.log(`  Unique Report File : ${this.relativeReportPath}`);
    console.log(`  Raw Diagnostic Log : ${this.relativeLogPath}`);
    if (this.errors.length > 0) {
      console.log(`  ⚠️ Issues Logged   : ${this.errors.length} issue(s) detected (Check log file)`);
    }
    console.log("================================================================================\n");

    return this.reportFilePath;
  }
}
