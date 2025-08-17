/**
 * Test Helper Functions for LI.FI E2E Tests
 * Utility functions to simplify and reuse common test logic.
 * Designed for clarity and demonstration purposes.
 */
/**
 * Test Utilities and Helper Functions
 * Demonstrates code reusability and professional test organization
 */

import { expect } from '@playwright/test';

export class TestHelpers {
  constructor(page) {
    this.page = page;
  }

  /**
   * Wait for page to be fully loaded with network idle
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Additional buffer for dynamic content
  }

  /**
   * Take a screenshot with timestamp for debugging
   */
  async takeTimestampedScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if element exists and is visible with timeout
   */
  async isElementVisible(selector, timeout = 5000) {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safe click with retry logic for flaky elements
   */
  async safeClick(selector, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await this.page.locator(selector).click({ timeout: 5000 });
        return true;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
    return false;
  }

  /**
   * Fill input with validation
   */
  async fillInputSafely(selector, value) {
    const input = this.page.locator(selector);
    await input.waitFor({ state: 'visible' });
    await input.clear();
    await input.fill(value);
    
    // Verify the value was set correctly
    const actualValue = await input.inputValue();
    expect(actualValue).toBe(value);
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Allow for scroll animation
  }

  /**
   * Check for console errors (excluding known acceptable ones)
   */
  async checkForConsoleErrors() {
    const errors = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        // Filter out known acceptable errors
        const acceptableErrors = [
          'favicon.ico',
          'Extension context invalidated',
          'Non-Error promise rejection captured'
        ];
        
        const errorText = msg.text();
        const isAcceptable = acceptableErrors.some(acceptable => 
          errorText.includes(acceptable)
        );
        
        if (!isAcceptable) {
          errors.push(errorText);
        }
      }
    });
    
    return errors;
  }

  /**
   * Measure page load performance
   */
  async measurePageLoadTime() {
    const startTime = Date.now();
    await this.waitForPageLoad();
    const endTime = Date.now();
    return endTime - startTime;
  }

  /**
   * Check if running on mobile device
   */
  async isMobileDevice() {
    const viewport = this.page.viewportSize();
    return viewport && viewport.width < 768;
  }

  /**
   * Handle modal dialogs safely
   */
  async handleModal(action = 'accept') {
    this.page.on('dialog', async dialog => {
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Wait for API response with specific URL pattern
   */
  async waitForApiResponse(urlPattern, timeout = 10000) {
    return await this.page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() === 200,
      { timeout }
    );
  }

  /**
   * Simulate network conditions
   */
  async simulateNetworkConditions(condition = 'slow3g') {
    const conditions = {
      slow3g: { downloadThroughput: 500 * 1024, uploadThroughput: 500 * 1024, latency: 400 },
      fast3g: { downloadThroughput: 1.6 * 1024 * 1024, uploadThroughput: 750 * 1024, latency: 150 },
      offline: { offline: true }
    };
    
    if (conditions[condition]) {
      await this.page.context().setOffline(conditions[condition].offline || false);
      if (!conditions[condition].offline) {
        // Note: Playwright doesn't have built-in network throttling like Puppeteer
        // This would need to be implemented at the browser level or using proxy
        console.log(`Simulating ${condition} network conditions`);
      }
    }
  }
}

export class DeFiTestHelpers extends TestHelpers {
  /**
   * DeFi-specific helper functions
   */

  /**
   * Check for wallet connection button
   */
  async findWalletConnectButton() {
    const selectors = [
      'button:has-text("Connect")',
      'button:has-text("Connect Wallet")',
      '[data-testid="connect-wallet"]',
      '.connect-wallet',
      'button[aria-label*="connect"]'
    ];

    for (const selector of selectors) {
      if (await this.isElementVisible(selector)) {
        return this.page.locator(selector);
      }
    }
    return null;
  }

  /**
   * Find token amount input fields
   */
  async findAmountInputs() {
    const selectors = [
      'input[type="number"]',
      'input[placeholder*="amount"]',
      'input[placeholder*="Amount"]',
      '[data-testid*="amount-input"]',
      '.amount-input'
    ];

    const inputs = [];
    for (const selector of selectors) {
      const elements = await this.page.locator(selector).all();
      inputs.push(...elements);
    }
    return inputs;
  }

  /**
   * Check for network/chain selector
   */
  async findNetworkSelector() {
    const selectors = [
      '[data-testid*="network"]',
      '[data-testid*="chain"]',
      '.network-select',
      '.chain-select',
      'select[name*="network"]',
      'select[name*="chain"]'
    ];

    for (const selector of selectors) {
      if (await this.isElementVisible(selector)) {
        return this.page.locator(selector);
      }
    }
    return null;
  }

  /**
   * Validate token address format
   */
  isValidTokenAddress(address) {
    // Ethereum address format validation
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  }

  /**
   * Check for gas fee display
   */
  async findGasFeeElements() {
    const selectors = [
      '[data-testid*="gas"]',
      '.gas-fee',
      '.fee-estimate',
      'text=/gas/i',
      'text=/fee/i'
    ];

    const elements = [];
    for (const selector of selectors) {
      const found = await this.page.locator(selector).all();
      elements.push(...found);
    }
    return elements;
  }

  /**
   * Simulate wallet connection flow
   */
  async simulateWalletConnection() {
    const connectButton = await this.findWalletConnectButton();
    
    if (connectButton) {
      await connectButton.click();
      await this.page.waitForTimeout(1000);
      
      // Look for wallet selection modal
      const walletModal = this.page.locator('[data-testid="wallet-modal"], .wallet-modal, .modal').first();
      
      if (await walletModal.isVisible()) {
        // Look for MetaMask option (most common)
        const metamaskOption = this.page.getByText('MetaMask', { exact: false });
        if (await metamaskOption.isVisible()) {
          await metamaskOption.click();
        }
        
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check for slippage settings
   */
  async findSlippageSettings() {
    const settingsButton = this.page.locator('[data-testid*="settings"], .settings, button[aria-label*="settings"]').first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await this.page.waitForTimeout(500);
      
      const slippageControls = this.page.locator('[data-testid*="slippage"], .slippage, input[placeholder*="slippage"]');
      return await slippageControls.count() > 0;
    }
    
    return false;
  }
}

export class ApiTestHelpers {
  constructor(request) {
    this.request = request;
  }

  /**
   * Make API request with retry logic
   */
  async makeRequestWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.request.get(url, options);
        if (response.status() < 500) {
          return response;
        }
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  /**
   * Validate API response structure
   */
  async validateResponseStructure(response, expectedFields) {
    expect(response.status()).toBeLessThan(400);
    
    const data = await response.json();
    
    for (const field of expectedFields) {
      expect(data).toHaveProperty(field);
    }
    
    return data;
  }

  /**
   * Measure API response time
   */
  async measureResponseTime(url, options = {}) {
    const startTime = Date.now();
    const response = await this.request.get(url, options);
    const endTime = Date.now();
    
    return {
      response,
      responseTime: endTime - startTime
    };
  }

  /**
   * Test API rate limiting
   */
  async testRateLimit(url, requestCount = 10) {
    const requests = [];
    
    for (let i = 0; i < requestCount; i++) {
      requests.push(this.request.get(url));
    }
    
    const responses = await Promise.all(requests);
    
    const successCount = responses.filter(r => r.status() === 200).length;
    const rateLimitedCount = responses.filter(r => r.status() === 429).length;
    
    return {
      total: requestCount,
      successful: successCount,
      rateLimited: rateLimitedCount,
      responses
    };
  }
}

export const CommonSelectors = {
  // Navigation
  navigation: 'nav, [role="navigation"], .navigation, .navbar',
  mobileMenu: '[data-testid="mobile-menu"], .mobile-menu, .hamburger',
  
  // Forms
  inputs: 'input, select, textarea',
  buttons: 'button, [role="button"], input[type="submit"]',
  
  // Modals
  modal: '[role="dialog"], .modal, .popup, .overlay',
  closeButton: '[data-testid="close"], .close, button[aria-label*="close"]',
  
  // DeFi specific
  walletConnect: 'button:has-text("Connect"), [data-testid="connect-wallet"]',
  tokenSelect: '.token-select, [data-testid*="token"]',
  amountInput: 'input[type="number"], [data-testid*="amount"]',
  
  // Common UI elements
  loading: '.loading, .spinner, [data-testid="loading"]',
  error: '.error, .alert-error, [role="alert"]',
  success: '.success, .alert-success, [data-testid="success"]'
};

export const TestData = {
  // Sample token addresses (Ethereum mainnet)
  tokens: {
    ETH: '0x0000000000000000000000000000000000000000',
    USDC: '0xA0b86a33E6441b8e8C7C7b0b2C4C2e4B4b4b4b4b',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  },
  
  // Common test amounts
  amounts: {
    small: '0.1',
    medium: '1.0',
    large: '10.0'
  },
  
  // Network IDs
  networks: {
    ethereum: '1',
    polygon: '137',
    arbitrum: '42161',
    optimism: '10'
  }
};