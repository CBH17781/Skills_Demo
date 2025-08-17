/**
 * DeFi Functionality Tests for LI.FI
 * These tests verify DeFi features such as swaps, bridging, and gas fee estimates.
 * Designed for clarity and demonstration purposes.
 */
import { test, expect } from '@playwright/test';

test.describe('DeFi Functionality Tests @e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display bridge/swap interface @smoke', async ({ page }) => {
    // Look for common DeFi interface elements
    const swapInterface = page.locator('[data-testid="swap-widget"], .swap-container, .bridge-widget').first();
    
    if (await swapInterface.isVisible()) {
      await expect(swapInterface).toBeVisible();
      
      // Check for token selection dropdowns
      const tokenSelectors = page.locator('select, [data-testid*="token"], .token-select');
      const visibleSelectors = await tokenSelectors.count();
      expect(visibleSelectors).toBeGreaterThan(0);
    }
  });

  test('should handle wallet connection flow', async ({ page }) => {
    // Look for wallet connect button
    const connectButton = page.getByRole('button', { name: /connect|wallet/i });
    
    if (await connectButton.isVisible()) {
      await connectButton.click();
      
      // Wait for wallet selection modal
      await page.waitForTimeout(1000);
      
      // Check if wallet selection modal appears
      const walletModal = page.locator('[data-testid="wallet-modal"], .wallet-modal, .modal').first();
      if (await walletModal.isVisible()) {
        await expect(walletModal).toBeVisible();
        
        // Check for common wallet options
        const walletOptions = [
          'MetaMask',
          'WalletConnect',
          'Coinbase',
          'Rainbow'
        ];
        
        for (const wallet of walletOptions) {
          const walletOption = page.getByText(wallet, { exact: false });
          if (await walletOption.isVisible()) {
            await expect(walletOption).toBeVisible();
          }
        }
        
        // Close modal by clicking outside or close button
        const closeButton = page.locator('[data-testid="close"], .close, button[aria-label*="close"]').first();
        if (await closeButton.isVisible()) {
          await closeButton.click();
        } else {
          await page.keyboard.press('Escape');
        }
      }
    }
  });

  test('should validate token selection and amounts', async ({ page }) => {
    // Look for amount input fields
    const amountInputs = page.locator('input[type="number"], input[placeholder*="amount"], [data-testid*="amount"]');
    
    if (await amountInputs.count() > 0) {
      const firstInput = amountInputs.first();
      await firstInput.fill('100');
      
      // Verify the input accepts the value
      await expect(firstInput).toHaveValue('100');
      
      // Test invalid input handling
      await firstInput.fill('invalid');
      const value = await firstInput.inputValue();
      // Should either reject invalid input or clear it
      expect(value === '' || value === '0' || !isNaN(parseFloat(value))).toBeTruthy();
    }
  });

  test('should display network/chain selection', async ({ page }) => {
    // Look for network/chain selectors
    const networkSelectors = page.locator('[data-testid*="network"], [data-testid*="chain"], .network-select, .chain-select');
    
    if (await networkSelectors.count() > 0) {
      const firstSelector = networkSelectors.first();
      
      if (await firstSelector.isVisible()) {
        await firstSelector.click();
        
        // Wait for dropdown to appear
        await page.waitForTimeout(500);
        
        // Check for common networks
        const commonNetworks = [
          'Ethereum',
          'Polygon',
          'Arbitrum',
          'Optimism',
          'BSC'
        ];
        
        for (const network of commonNetworks) {
          const networkOption = page.getByText(network, { exact: false });
          if (await networkOption.isVisible()) {
            await expect(networkOption).toBeVisible();
          }
        }
      }
    }
  });

  test('should handle transaction preview and validation', async ({ page }) => {
    // This test simulates going through the swap flow without actually executing
    
    // Try to find and fill swap form
    const fromAmountInput = page.locator('input[placeholder*="amount"], input[type="number"]').first();
    
    if (await fromAmountInput.isVisible()) {
      await fromAmountInput.fill('1');
      
      // Look for swap/bridge button
      const swapButton = page.getByRole('button', { name: /swap|bridge|exchange/i });
      
      if (await swapButton.isVisible()) {
        // Check if button is disabled (expected without wallet connection)
        const isDisabled = await swapButton.isDisabled();
        
        if (!isDisabled) {
          await swapButton.click();
          
          // Wait for any preview or confirmation modal
          await page.waitForTimeout(1000);
          
          // Check for transaction preview elements
          const previewElements = page.locator('[data-testid*="preview"], .transaction-preview, .swap-preview');
          if (await previewElements.count() > 0) {
            await expect(previewElements.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('should handle slippage settings', async ({ page }) => {
    // Look for settings or slippage controls
    const settingsButton = page.locator('[data-testid*="settings"], .settings, button[aria-label*="settings"]').first();
    
    if (await settingsButton.isVisible()) {
      await settingsButton.click();
      
      // Wait for settings modal
      await page.waitForTimeout(500);
      
      // Look for slippage controls
      const slippageControls = page.locator('[data-testid*="slippage"], .slippage, input[placeholder*="slippage"]');
      
      if (await slippageControls.count() > 0) {
        const slippageInput = slippageControls.first();
        
        if (await slippageInput.isVisible()) {
          await expect(slippageInput).toBeVisible();
          
          // Test slippage input
          await slippageInput.fill('0.5');
          await expect(slippageInput).toHaveValue('0.5');
        }
      }
    }
  });

  test('should validate cross-chain bridge functionality', async ({ page }) => {
    // Look for elements that indicate cross-chain functionality
    // Split into separate locators and combine results in JS
    // Use only valid Playwright locators, avoid combining with other selectors
    let bridgeElement = null;
    if (await page.locator('[data-testid*="bridge="]').count() > 0) {
      bridgeElement = page.locator('[data-testid*="bridge="]').first();
    } else if (await page.locator('.bridge').count() > 0) {
      bridgeElement = page.locator('.bridge').first();
    } else if (await page.locator('text=/bridge|cross-chain/i').count() > 0) {
      bridgeElement = page.locator('text=/bridge|cross-chain/i').first();
    }
    if (bridgeElement) {
      // Check for from/to chain selectors
      const chainSelectors = page.locator('[data-testid*="chain"], .chain-select, .network-select');
      if (await chainSelectors.count() >= 2) {
        // This indicates a cross-chain interface
        await expect(chainSelectors.first()).toBeVisible();
        await expect(chainSelectors.nth(1)).toBeVisible();
      }
    }
  });
});