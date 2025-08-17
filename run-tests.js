#!/usr/bin/env node

/**
 * Test Runner Script
 * Demonstrates professional test execution and reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.startTime = Date.now();
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      suites: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runTestSuite(suiteName, command) {
    this.log(`Starting ${suiteName} tests...`, 'info');
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 300000 // 5 minutes timeout
      });
      
      this.log(`✅ ${suiteName} tests completed successfully`, 'success');
      return { success: true, output };
    } catch (error) {
      this.log(`❌ ${suiteName} tests failed: ${error.message}`, 'error');
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  async runAllTests() {
    this.log('🚀 Starting LI.FI QA Automation Test Suite', 'info');
    this.log('=' .repeat(60), 'info');

    const testSuites = [
      {
        name: 'Smoke Tests',
        command: 'npx playwright test --grep "@smoke" --reporter=json',
        critical: true
      },
      {
        name: 'API Tests',
        command: 'npx playwright test --grep "@api" --reporter=json',
        critical: true
      },
      {
        name: 'E2E Tests',
        command: 'npx playwright test --grep "@e2e" --reporter=json',
        critical: false
      },
      {
        name: 'Performance Tests',
        command: 'npx playwright test --grep "@performance" --reporter=json',
        critical: false
      },
      {
        name: 'Accessibility Tests',
        command: 'npx playwright test --grep "@a11y" --reporter=json',
        critical: false
      },
      {
        name: 'Security Tests',
        command: 'npx playwright test --grep "@security" --reporter=json',
        critical: false
      }
    ];

    let criticalFailures = 0;
    let totalFailures = 0;

    for (const suite of testSuites) {
      const result = await this.runTestSuite(suite.name, suite.command);
      
      this.results.suites.push({
        name: suite.name,
        success: result.success,
        critical: suite.critical,
        output: result.output
      });

      if (!result.success) {
        totalFailures++;
        if (suite.critical) {
          criticalFailures++;
        }
      }

      // Small delay between test suites
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    this.generateSummaryReport(criticalFailures, totalFailures);
    this.generateDetailedReport();
  }

  generateSummaryReport(criticalFailures, totalFailures) {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    
    this.log('=' .repeat(60), 'info');
    this.log('📊 TEST EXECUTION SUMMARY', 'info');
    this.log('=' .repeat(60), 'info');
    
    this.log(`⏱️  Total execution time: ${duration} seconds`, 'info');
    this.log(`📋 Test suites executed: ${this.results.suites.length}`, 'info');
    this.log(`✅ Successful suites: ${this.results.suites.filter(s => s.success).length}`, 'success');
    this.log(`❌ Failed suites: ${totalFailures}`, totalFailures > 0 ? 'error' : 'info');
    this.log(`🚨 Critical failures: ${criticalFailures}`, criticalFailures > 0 ? 'error' : 'success');

    if (criticalFailures > 0) {
      this.log('⚠️  CRITICAL TEST FAILURES DETECTED!', 'error');
      this.log('   Please review and fix critical issues before deployment.', 'error');
    } else if (totalFailures > 0) {
      this.log('⚠️  Some non-critical tests failed.', 'warn');
      this.log('   Consider reviewing these issues for optimal quality.', 'warn');
    } else {
      this.log('🎉 ALL TESTS PASSED! Ready for deployment.', 'success');
    }

    this.log('=' .repeat(60), 'info');
  }

  generateDetailedReport() {
    const reportPath = path.join(__dirname, 'test-results', 'summary-report.json');
    
    // Ensure directory exists
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
      environment: process.env.NODE_ENV || 'production',
      results: this.results,
      summary: {
        totalSuites: this.results.suites.length,
        passedSuites: this.results.suites.filter(s => s.success).length,
        failedSuites: this.results.suites.filter(s => !s.success).length,
        criticalFailures: this.results.suites.filter(s => !s.success && s.critical).length
      }
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Detailed report saved to: ${reportPath}`, 'info');
  }

  async checkPrerequisites() {
    this.log('🔍 Checking prerequisites...', 'info');

    // Check if Playwright is installed
    try {
      execSync('npx playwright --version', { stdio: 'pipe' });
      this.log('✅ Playwright is installed', 'success');
    } catch (error) {
      this.log('❌ Playwright not found. Run: npm install', 'error');
      process.exit(1);
    }

    // Check if browsers are installed
    try {
      const browsersPath = path.join(__dirname, 'node_modules', '@playwright', 'test');
      if (fs.existsSync(browsersPath)) {
        this.log('✅ Playwright browsers are available', 'success');
      } else {
        this.log('⚠️  Playwright browsers may not be installed. Run: npx playwright install', 'warn');
      }
    } catch (error) {
      this.log('⚠️  Could not verify browser installation', 'warn');
    }

    // Check network connectivity
    try {
      execSync('ping -c 1 li.fi', { stdio: 'pipe', timeout: 5000 });
      this.log('✅ Network connectivity to li.fi confirmed', 'success');
    } catch (error) {
      this.log('⚠️  Network connectivity issue detected', 'warn');
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const runner = new TestRunner();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
LI.FI QA Automation Test Runner

Usage: node run-tests.js [options]

Options:
  --help, -h          Show this help message
  --check-prereq      Check prerequisites only
  --suite <name>      Run specific test suite
  --quick             Run only smoke and API tests

Available test suites:
  - smoke             Critical functionality tests
  - api               API endpoint tests
  - e2e               End-to-end workflow tests
  - performance       Performance and load tests
  - accessibility     Accessibility compliance tests
  - security          Security vulnerability tests

Examples:
  node run-tests.js                    # Run all test suites
  node run-tests.js --suite smoke      # Run only smoke tests
  node run-tests.js --quick            # Run critical tests only
  node run-tests.js --check-prereq     # Check prerequisites
    `);
    return;
  }

  if (args.includes('--check-prereq')) {
    await runner.checkPrerequisites();
    return;
  }

  const suiteIndex = args.indexOf('--suite');
  if (suiteIndex !== -1 && args[suiteIndex + 1]) {
    const suiteName = args[suiteIndex + 1];
    const command = `npx playwright test --grep "@${suiteName}"`;
    await runner.runTestSuite(`${suiteName} tests`, command);
    return;
  }

  if (args.includes('--quick')) {
    runner.log('🏃‍♂️ Running quick test suite (smoke + API tests)', 'info');
    await runner.runTestSuite('Smoke Tests', 'npx playwright test --grep "@smoke"');
    await runner.runTestSuite('API Tests', 'npx playwright test --grep "@api"');
    return;
  }

  // Run full test suite
  await runner.checkPrerequisites();
  await runner.runAllTests();
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\x1b[31m❌ Uncaught Exception:', error.message, '\x1b[0m');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\x1b[31m❌ Unhandled Rejection at:', promise, 'reason:', reason, '\x1b[0m');
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('\x1b[31m❌ Test runner failed:', error.message, '\x1b[0m');
    process.exit(1);
  });
}

module.exports = TestRunner;