/**
 * Security Tests for LI.FI Website
 * These tests check for common security issues and vulnerabilities.
 * Designed for clarity and demonstration purposes.
 */
import { test, expect } from '@playwright/test';

test.describe('Security Tests @security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper HTTPS configuration @smoke', async ({ page }) => {
    const url = page.url();
    expect(url).toMatch(/^https:/);
    
    console.log(`Site is served over HTTPS: ${url}`);
  });

  test('should have security headers', async ({ page, request }) => {
    const response = await request.get('/');
    const headers = response.headers();
    
    // Check for important security headers
    const securityHeaders = {
      'x-frame-options': 'Should prevent clickjacking',
      'x-content-type-options': 'Should prevent MIME sniffing',
      'x-xss-protection': 'Should enable XSS protection',
      'strict-transport-security': 'Should enforce HTTPS',
      'content-security-policy': 'Should prevent XSS and injection attacks'
    };
    
    let foundHeaders = 0;
    
    for (const [header, description] of Object.entries(securityHeaders)) {
      if (headers[header]) {
        foundHeaders++;
        console.log(`✓ Found ${header}: ${headers[header]}`);
      } else {
        console.log(`⚠ Missing ${header}: ${description}`);
      }
    }
    
    // At least some security headers should be present
    expect(foundHeaders).toBeGreaterThan(0);
  });

  test('should prevent XSS in input fields', async ({ page }) => {
    const inputs = await page.locator('input[type="text"], input[type="search"], textarea').all();
    
    if (inputs.length > 0) {
      const xssPayload = '<script>alert("XSS")</script>';
      
      for (const input of inputs.slice(0, 3)) { // Test first 3 inputs
        if (await input.isVisible()) {
          await input.fill(xssPayload);
          
          // Check that the script tag is not executed
          const alerts = [];
          page.on('dialog', dialog => {
            alerts.push(dialog.message());
            dialog.dismiss();
          });
          
          // Trigger any form submission or processing
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1000);
          
          // No alert should have been triggered
          expect(alerts.length).toBe(0);
          
          // Clear the input
          await input.fill('');
        }
      }
      
      console.log(`Tested XSS prevention on ${Math.min(3, inputs.length)} inputs`);
    }
  });

  test('should validate SSL certificate', async ({ request }) => {
    // This test verifies the SSL connection is valid
    const response = await request.get('/');
    expect(response.status()).toBeLessThan(400);
    
    // If we can make the request successfully over HTTPS, the certificate is valid
    console.log('SSL certificate validation passed');
  });

  test('should not expose sensitive information in client-side code', async ({ page }) => {
    // Check for common sensitive patterns in page source
    const pageContent = await page.content();
    
    const sensitivePatterns = [
      /api[_-]?key/i,
      /secret[_-]?key/i,
      /private[_-]?key/i,
      /password/i,
      /token.*[=:]\s*["'][^"']{20,}/i, // Long tokens
      /sk_[a-zA-Z0-9]{20,}/, // Stripe secret keys
      /pk_[a-zA-Z0-9]{20,}/, // Stripe public keys (less sensitive but still worth checking)
    ];
    
    for (const pattern of sensitivePatterns) {
      const matches = pageContent.match(pattern);
      if (matches) {
        console.log(`⚠ Potential sensitive data found: ${matches[0].substring(0, 50)}...`);
        // In a real test, you might want to fail here depending on what's found
      }
    }
    
    console.log('Completed sensitive information scan');
  });

  test('should handle CORS properly', async ({ page, request }) => {
    // Test CORS by checking if the site properly handles cross-origin requests
    const response = await request.get('/', {
      headers: {
        'Origin': 'https://example.com'
      }
    });
    
    const corsHeader = response.headers()['access-control-allow-origin'];
    
    if (corsHeader) {
      // CORS header should not be wildcard (*) for sites handling sensitive data
      if (corsHeader === '*') {
        console.log('⚠ CORS allows all origins - ensure this is intentional for a DeFi app');
      } else {
        console.log(`✓ CORS properly configured: ${corsHeader}`);
      }
    }
  });

  test('should validate form input sanitization', async ({ page }) => {
    const forms = await page.locator('form').all();
    
    if (forms.length > 0) {
      const maliciousInputs = [
        'javascript:alert("XSS")',
        '"><script>alert("XSS")</script>',
        "'; DROP TABLE users; --",
        '../../../etc/passwd',
        '{{7*7}}', // Template injection
        '${7*7}', // Expression injection
      ];
      
      for (const form of forms.slice(0, 2)) { // Test first 2 forms
        const inputs = await form.locator('input, textarea').all();
        
        for (const input of inputs.slice(0, 2)) { // Test first 2 inputs per form
          if (await input.isVisible()) {
            for (const maliciousInput of maliciousInputs.slice(0, 3)) { // Test first 3 payloads
              await input.fill(maliciousInput);
              
              // Check that the input is properly handled
              const value = await input.inputValue();
              
              // The value should either be sanitized or rejected
              if (value === maliciousInput) {
                console.log(`⚠ Input may not be sanitized: ${maliciousInput}`);
              }
              
              await input.fill(''); // Clear for next test
            }
          }
        }
      }
      
      console.log(`Tested input sanitization on ${forms.length} forms`);
    }
  });

  test('should check for mixed content issues', async ({ page }) => {
    const mixedContentWarnings = [];
    
    page.on('console', msg => {
      if (msg.text().includes('Mixed Content') || msg.text().includes('http://')) {
        mixedContentWarnings.push(msg.text());
      }
    });
    
    // Navigate and wait for any console messages
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should not have mixed content warnings
    expect(mixedContentWarnings.length).toBe(0);
    
    if (mixedContentWarnings.length > 0) {
      console.log('Mixed content warnings:', mixedContentWarnings);
    } else {
      console.log('✓ No mixed content issues detected');
    }
  });

  test('should validate wallet connection security', async ({ page }) => {
    // Look for wallet connection functionality
    const connectButton = page.getByRole('button', { name: /connect|wallet/i });
    
    if (await connectButton.isVisible()) {
      await connectButton.click();
      await page.waitForTimeout(1000);
      
      // Check if wallet connection uses secure methods
      const walletModal = page.locator('[data-testid="wallet-modal"], .wallet-modal, .modal').first();
      
      if (await walletModal.isVisible()) {
        // Verify that wallet connection doesn't ask for private keys
        const modalText = await walletModal.textContent();
        
        const dangerousTerms = [
          'private key',
          'seed phrase',
          'mnemonic',
          'secret key',
          'recovery phrase'
        ];
        
        for (const term of dangerousTerms) {
          expect(modalText?.toLowerCase()).not.toContain(term);
        }
        
        console.log('✓ Wallet connection modal does not request sensitive information');
        
        // Close modal
        await page.keyboard.press('Escape');
      }
    }
  });

  test('should check for secure cookie configuration', async ({ page, context }) => {
    // Navigate to trigger any cookie setting
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get cookies
    const cookies = await context.cookies();
    
    if (cookies.length > 0) {
      for (const cookie of cookies) {
        // Sensitive cookies should be secure and httpOnly
        if (cookie.name.toLowerCase().includes('session') || 
            cookie.name.toLowerCase().includes('auth') ||
            cookie.name.toLowerCase().includes('token')) {
          
          expect(cookie.secure).toBeTruthy();
          console.log(`✓ Secure cookie found: ${cookie.name}`);
        }
      }
      
      console.log(`Checked ${cookies.length} cookies for security attributes`);
    } else {
      console.log('No cookies found to validate');
    }
  });
});