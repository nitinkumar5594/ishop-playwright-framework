// @ts-check
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_FILE = path.resolve(__dirname, "test_cases_registry.json");
const HOTELS_DIR = path.resolve(__dirname, "hotels");
const FLIGHTS_DIR = path.resolve(__dirname, "flights");
const ROOT_README = path.resolve(__dirname, "README.md");

/**
 * Automated Test Case Tracker & Registry Synchronizer
 * - Auto-increments test execution count whenever a test runs.
 * - Dynamically registers any new or modified test cases.
 * - Automatically keeps Markdown documentation synchronized with live stats.
 */
export class TestCaseTracker {
  constructor() {
    this.registry = this.loadRegistry();
  }

  /**
   * Load test cases registry from disk
   */
  loadRegistry() {
    try {
      if (fs.existsSync(REGISTRY_FILE)) {
        const raw = fs.readFileSync(REGISTRY_FILE, "utf8");
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error("[TestCaseTracker] Error reading registry:", e.message);
    }
    return {
      lastUpdated: new Date().toISOString(),
      summary: { totalTestCases: 0, totalExecutions: 0, passedExecutions: 0, failedExecutions: 0 },
      testCases: []
    };
  }

  /**
   * Persist registry to disk
   */
  saveRegistry() {
    this.registry.lastUpdated = new Date().toISOString();
    this.recalculateSummary();
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(this.registry, null, 2), "utf8");
  }

  /**
   * Recalculate summary metrics across all test cases
   */
  recalculateSummary() {
    const cases = this.registry.testCases || [];
    let totalExec = 0;
    let passedExec = 0;
    let failedExec = 0;
    let hotelPos = 0;
    let hotelNeg = 0;
    let flightPos = 0;
    let flightNeg = 0;

    cases.forEach(tc => {
      totalExec += (tc.totalExecutions || 0);
      passedExec += (tc.passedCount || 0);
      failedExec += (tc.failedCount || 0);

      if (tc.module === "hotels") {
        if (tc.category === "positive") hotelPos++;
        else hotelNeg++;
      } else if (tc.module === "flights") {
        if (tc.category === "positive") flightPos++;
        else flightNeg++;
      }
    });

    this.registry.summary = {
      totalTestCases: cases.length,
      totalExecutions: totalExec,
      passedExecutions: passedExec,
      failedExecutions: failedExec,
      hotels: {
        total: hotelPos + hotelNeg,
        positive: hotelPos,
        negative: hotelNeg
      },
      flights: {
        total: flightPos + flightNeg,
        positive: flightPos,
        negative: flightNeg
      }
    };
  }

  /**
   * Record a test case execution (increments execution counters automatically)
   * @param {string} testCaseId Unique ID of the test case (e.g. TC_HOTEL_POS_001)
   * @param {"PASSED" | "FAILED" | "SKIPPED"} status
   * @param {object} [details={}] Optional runtime metadata (duration, error message, etc.)
   */
  recordExecution(testCaseId, status = "PASSED", details = {}) {
    this.registry = this.loadRegistry();
    let tc = this.registry.testCases.find(c => c.id === testCaseId);

    // Auto-register new test case if not existing
    if (!tc) {
      console.log(`[TestCaseTracker] 🆕 Auto-registering new test case: ${testCaseId}`);
      tc = {
        id: testCaseId,
        module: testCaseId.toLowerCase().includes("hotel") ? "hotels" : "flights",
        category: testCaseId.toLowerCase().includes("neg") ? "negative" : "positive",
        title: details.title || `Test Case ${testCaseId}`,
        description: details.description || "Auto-registered from test execution",
        severity: details.severity || "MEDIUM",
        preconditions: details.preconditions || "N/A",
        steps: details.steps || ["Executed via Playwright script"],
        expectedResult: details.expectedResult || "Expected behavior verified",
        totalExecutions: 0,
        passedCount: 0,
        failedCount: 0,
        lastStatus: "NOT_RUN",
        lastExecutedAt: null
      };
      this.registry.testCases.push(tc);
    }

    // Increment execution counts
    tc.totalExecutions = (tc.totalExecutions || 0) + 1;
    if (status === "PASSED") {
      tc.passedCount = (tc.passedCount || 0) + 1;
    } else if (status === "FAILED") {
      tc.failedCount = (tc.failedCount || 0) + 1;
    }

    tc.lastStatus = status;
    tc.lastExecutedAt = new Date().toISOString();
    if (details.error) {
      tc.lastError = details.error;
    }

    console.log(`[TestCaseTracker] 📈 Updated ${tc.id}: total executions = ${tc.totalExecutions}, status = ${status}`);

    this.saveRegistry();
    this.syncMarkdown();
    return tc;
  }

  /**
   * Register or update a test case specification
   * @param {object} testCaseData
   */
  registerTestCase(testCaseData) {
    const existingIndex = this.registry.testCases.findIndex(c => c.id === testCaseData.id);
    if (existingIndex >= 0) {
      this.registry.testCases[existingIndex] = {
        ...this.registry.testCases[existingIndex],
        ...testCaseData
      };
    } else {
      this.registry.testCases.push({
        totalExecutions: 0,
        passedCount: 0,
        failedCount: 0,
        lastStatus: "NOT_RUN",
        lastExecutedAt: null,
        ...testCaseData
      });
    }
    this.saveRegistry();
    this.syncMarkdown();
  }

  /**
   * Generate Markdown tables for a specific category
   * @param {string} module 'hotels' | 'flights'
   * @param {string} category 'positive' | 'negative'
   */
  generateMarkdownForCategory(module, category) {
    const cases = this.registry.testCases.filter(c => c.module === module && c.category === category);
    const modTitle = module.charAt(0).toUpperCase() + module.slice(1);
    const catTitle = category.charAt(0).toUpperCase() + category.slice(1);

    let md = `# 📋 ${modTitle} - ${catTitle} Test Cases\n\n`;
    md += `> **Auto-Updated**: ${new Date(this.registry.lastUpdated).toLocaleString()}\n`;
    md += `> **Total Cases**: ${cases.length}\n\n`;

    md += `## Summary Matrix\n\n`;
    md += `| Test Case ID | Title | Severity | Total Runs | Last Status | Last Executed |\n`;
    md += `|---|---|---|---|---|---|\n`;

    cases.forEach(tc => {
      const statusIcon = tc.lastStatus === "PASSED" ? "✅ PASSED" : (tc.lastStatus === "FAILED" ? "❌ FAILED" : "⚪ NOT RUN");
      const lastTime = tc.lastExecutedAt ? new Date(tc.lastExecutedAt).toLocaleTimeString() : "-";
      md += `| **[${tc.id}](#${tc.id.toLowerCase().replace(/_/g, "-")})** | ${tc.title} | \`${tc.severity}\` | **${tc.totalExecutions}** | ${statusIcon} | ${lastTime} |\n`;
    });

    md += `\n---\n\n## Detailed Test Cases\n\n`;

    cases.forEach((tc, idx) => {
      const statusBadge = tc.lastStatus === "PASSED" ? "🟢 PASSED" : (tc.lastStatus === "FAILED" ? "🔴 FAILED" : "⚪ NOT RUN");
      md += `### ${idx + 1}. <a id="${tc.id.toLowerCase().replace(/_/g, "-")}"></a>${tc.id}: ${tc.title}\n\n`;
      md += `- **Module**: \`${tc.module.toUpperCase()}\` | **Category**: \`${tc.category.toUpperCase()}\` | **Severity**: \`${tc.severity}\`\n`;
      md += `- **Execution Statistics**: Total Runs: **${tc.totalExecutions}** (Passed: ${tc.passedCount}, Failed: ${tc.failedCount}) | Status: **${statusBadge}**\n`;
      md += `- **Pre-conditions**: ${tc.preconditions}\n`;
      md += `- **Description**: ${tc.description}\n\n`;
      md += `**Test Steps**:\n`;
      (tc.steps || []).forEach((st, sIdx) => {
        md += `${sIdx + 1}. ${st}\n`;
      });
      md += `\n**Expected Result**:\n> ${tc.expectedResult}\n\n`;
      md += `---\n\n`;
    });

    return md;
  }

  /**
   * Generate Root README overview
   */
  generateRootReadme() {
    const s = this.registry.summary;
    let md = `# 🧪 iShop Playwright Automation - Test Cases Registry\n\n`;
    md += `Automated test repository and live execution counter for **Hotels** and **Flights**.\n\n`;

    md += `> [!NOTE]\n`;
    md += `> This registry is **self-updating**: every time an automated Playwright test executes, the execution count increments automatically (\`executionCount++\`), status is updated, and this documentation is regenerated.\n\n`;

    md += `## 📊 Live Execution Metrics\n\n`;
    md += `| Category | Total Test Cases | Total Executions | Passed | Failed | Pass Rate |\n`;
    md += `|---|---|---|---|---|---|\n`;

    const passRate = s.totalExecutions > 0 ? ((s.passedExecutions / s.totalExecutions) * 100).toFixed(1) + "%" : "N/A";
    md += `| **Overall Suite** | **${s.totalTestCases}** | **${s.totalExecutions}** | **${s.passedExecutions}** | **${s.failedExecutions}** | **${passRate}** |\n`;
    md += `| 🏨 **Hotels - Positive** | ${s.hotels.positive} | - | - | - | - |\n`;
    md += `| 🏨 **Hotels - Negative** | ${s.hotels.negative} | - | - | - | - |\n`;
    md += `| ✈️ **Flights - Positive** | ${s.flights.positive} | - | - | - | - |\n`;
    md += `| ✈️ **Flights - Negative** | ${s.flights.negative} | - | - | - | - |\n\n`;

    md += `---\n\n`;
    md += `## 📁 Test Case Suites\n\n`;
    md += `### 🏨 Hotels\n`;
    md += `- **[Positive Test Cases (8)](./hotels/positive_test_cases.md)**: Search, date selection (15th - 16th Oct), rooms/guests, hotel listing, room selection, policy acceptance, checkout consent.\n`;
    md += `- **[Negative Test Cases (6)](./hotels/negative_test_cases.md)**: Empty destination, invalid city, disabled past dates, check-out before check-in, room sold-out recovery, missing consent validation.\n\n`;

    md += `### ✈️ Flights\n`;
    md += `- **[Positive Test Cases (8)](./flights/positive_test_cases.md)**: One-way valid search (DEL-BOM), calendar date selection, passenger & cabin configuration, flight listing, fare selection, round-trip search, traveler details entry.\n`;
    md += `- **[Negative Test Cases (6)](./flights/negative_test_cases.md)**: Same origin and destination, empty search fields, infant count exceeding adults, past date selection, return date earlier than departure, invalid contact formatting.\n\n`;

    md += `---\n\n`;
    md += `## 🚀 Execution & Tracking Commands\n\n`;
    md += `\`\`\`bash\n`;
    md += `# View Live Test Case Summary & Execution Counts\n`;
    md += `npm run test:cases:summary\n\n`;
    md += `# Run Positive Hotel Flow (Headed)\n`;
    md += `npm run test:hotel:preprod\n\n`;
    md += `# Run Negative Hotel Validations\n`;
    md += `npm run test:hotel:negative\n\n`;
    md += `# Run Positive Flight Flow (Headed)\n`;
    md += `npm run test:flight:preprod\n\n`;
    md += `# Run Negative Flight Validations\n`;
    md += `npm run test:flight:negative\n`;
    md += `\`\`\`\n`;

    return md;
  }

  /**
   * Synchronize all Markdown files with current registry data
   */
  syncMarkdown() {
    if (!fs.existsSync(HOTELS_DIR)) fs.mkdirSync(HOTELS_DIR, { recursive: true });
    if (!fs.existsSync(FLIGHTS_DIR)) fs.mkdirSync(FLIGHTS_DIR, { recursive: true });

    // Write Hotels
    fs.writeFileSync(path.join(HOTELS_DIR, "positive_test_cases.md"), this.generateMarkdownForCategory("hotels", "positive"), "utf8");
    fs.writeFileSync(path.join(HOTELS_DIR, "negative_test_cases.md"), this.generateMarkdownForCategory("hotels", "negative"), "utf8");

    // Write Flights
    fs.writeFileSync(path.join(FLIGHTS_DIR, "positive_test_cases.md"), this.generateMarkdownForCategory("flights", "positive"), "utf8");
    fs.writeFileSync(path.join(FLIGHTS_DIR, "negative_test_cases.md"), this.generateMarkdownForCategory("flights", "negative"), "utf8");

    // Write Root README
    fs.writeFileSync(ROOT_README, this.generateRootReadme(), "utf8");
    console.log("[TestCaseTracker] 📄 Markdown documentation synchronized successfully.");
  }

  /**
   * Print formatted summary to console
   */
  printSummary() {
    this.recalculateSummary();
    const s = this.registry.summary;
    console.log("\n================================================================================");
    console.log("             🧪 TEST CASES REGISTRY & LIVE EXECUTION STATS");
    console.log("================================================================================");
    console.log(`  Total Test Cases    : ${s.totalTestCases}`);
    console.log(`  Total Executions    : ${s.totalExecutions}`);
    console.log(`  Passed Executions   : ${s.passedExecutions}`);
    console.log(`  Failed Executions   : ${s.failedExecutions}`);
    console.log("--------------------------------------------------------------------------------");
    console.log(`  🏨 Hotels  - Positive : ${s.hotels.positive} | Negative : ${s.hotels.negative}`);
    console.log(`  ✈️ Flights - Positive : ${s.flights.positive} | Negative : ${s.flights.negative}`);
    console.log(`  Last Updated        : ${new Date(this.registry.lastUpdated).toLocaleString()}`);
    console.log("================================================================================\n");
  }
}

export const testCaseTracker = new TestCaseTracker();

// Run CLI directly if invoked from command line
if (process.argv[1] && process.argv[1].endsWith("TestCaseTracker.js")) {
  if (process.argv.includes("--sync")) {
    testCaseTracker.syncMarkdown();
  } else {
    testCaseTracker.printSummary();
  }
}
