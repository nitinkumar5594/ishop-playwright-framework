// @ts-check
import fs from "fs";
import path from "path";

/**
 * Custom Script Reporter
 * Creates unique, standalone HTML execution reports for each script run,
 * and prints clear headers and summaries in the console.
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

    // Generate unique timestamp & unique report file path
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
    console.log(`  Browser / Device   : ${browser}`);
    console.log(`  Started At         : ${new Date().toLocaleString()}`);
    console.log("================================================================================\n");
  }

  /**
   * Record a completed step
   * @param {number} stepNum
   * @param {string} name
   * @param {"PASSED" | "FAILED" | "INFO"} [status="PASSED"]
   * @param {string} [details=""]
   */
  addStep(stepNum, name, status = "PASSED", details = "") {
    this.steps.push({
      stepNum,
      name,
      status,
      details,
      time: new Date().toLocaleTimeString()
    });
  }

  /**
   * Generate standalone HTML report and print execution summary
   * @param {"PASSED" | "FAILED"} [status="PASSED"]
   * @param {string} [finalUrl=""]
   * @returns {string} Path to generated report file
   */
  finishReport(status = "PASSED", finalUrl = "") {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const totalSteps = this.steps.length;
    const passedSteps = this.steps.filter(s => s.status === "PASSED").length;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${this.scriptName} - Test Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 28px; }
    .container { max-width: 980px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #334155; }
    h1 { margin: 0 0 20px 0; color: #38bdf8; font-size: 24px; display: flex; align-items: center; justify-content: space-between; }
    .badge { padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .badge-passed { background: #16a34a; color: white; }
    .badge-failed { background: #dc2626; color: white; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 24px 0; background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #1e293b; }
    .meta-item label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px; }
    .meta-item value { font-size: 15px; font-weight: 600; color: #f1f5f9; word-break: break-all; }
    .steps-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    .steps-table th { text-align: left; padding: 12px; background: #334155; color: #e2e8f0; font-size: 13px; text-transform: uppercase; }
    .steps-table td { padding: 12px; border-bottom: 1px solid #334155; font-size: 14px; }
    .step-ok { color: #4ade80; font-weight: bold; }
    .step-fail { color: #f87171; font-weight: bold; }
    .footer { margin-top: 28px; font-size: 12px; color: #64748b; text-align: right; border-top: 1px solid #334155; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>
      <span>${this.scriptName}</span>
      <span class="badge ${status === "PASSED" ? "badge-passed" : "badge-failed"}">${status}</span>
    </h1>
    <div class="meta-grid">
      <div class="meta-item"><label>Script File</label><value>${this.scriptPath}</value></div>
      <div class="meta-item"><label>Duration</label><value>${duration}s</value></div>
      <div class="meta-item"><label>Steps Passed</label><value>${passedSteps} / ${totalSteps}</value></div>
      <div class="meta-item"><label>Report File</label><value>${this.reportFileName}</value></div>
    </div>
    ${finalUrl ? `<p style="margin: 16px 0; color: #cbd5e1;"><strong>Final Landing URL:</strong> <a href="${finalUrl}" style="color: #38bdf8; text-decoration: none;" target="_blank">${finalUrl}</a></p>` : ""}
    <table class="steps-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Step Name</th>
          <th>Status</th>
          <th>Details</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        ${this.steps.map(s => `
        <tr>
          <td>${s.stepNum}</td>
          <td><strong>${s.name}</strong></td>
          <td class="${s.status === "PASSED" ? "step-ok" : "step-fail"}">${s.status}</td>
          <td>${s.details || "-"}</td>
          <td>${s.time}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <div class="footer">Generated by Playwright Automation Suite • ${new Date().toLocaleString()}</div>
  </div>
</body>
</html>`;

    fs.writeFileSync(this.reportFilePath, htmlContent, "utf8");

    console.log("\n================================================================================");
    console.log(`              ${this.scriptName.toUpperCase()} - EXECUTION SUMMARY`);
    console.log("================================================================================");
    console.log(`  Test Status        : ${status === "PASSED" ? "PASSED [✓]" : "FAILED [✗]"}`);
    console.log(`  Total Steps        : ${passedSteps} / ${totalSteps} Passed`);
    console.log(`  Duration           : ${duration}s`);
    console.log(`  Unique Report File : ${this.relativeReportPath}`);
    console.log(`  Playwright HTML    : Run "npm run test:report" or "npx playwright show-report"`);
    console.log("================================================================================\n");

    return this.reportFilePath;
  }
}
