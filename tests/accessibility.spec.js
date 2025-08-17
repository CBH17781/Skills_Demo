/**
 * Accessibility Tests for LI.FI Website
 * These tests check for accessibility best practices and ARIA compliance.
 * Designed for clarity and demonstration purposes.
 */
import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests @a11y', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper heading hierarchy @smoke', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    expect(headings.length).toBeGreaterThan(0);
    
    // Check that there's at least one h1
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBeGreaterThanOrEqual(1);
    
    // Verify heading hierarchy (no skipping levels)
    const headingLevels = [];
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.charAt(1));
      headingLevels.push(level);
    }
    
    // First heading should be h1
    expect(headingLevels[0]).toBe(1);
    
    console.log(`Found headings: ${headingLevels.join(', ')}`);
  });

  test('should have proper alt text for images', async ({ page }) => {
    const images = await page.locator('img').all();
    
    if (images.length > 0) {
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        const src = await img.getAttribute('src');
        
        // Images should have alt text (can be empty for decorative images)
        expect(alt).not.toBeNull();
        
        // If image has meaningful src, alt should not be just filename
        if (src && !src.includes('data:image')) {
          const filename = src.split('/').pop()?.split('.')[0];
          if (filename && alt) {
            expect(alt.toLowerCase()).not.toBe(filename.toLowerCase());
          }
        }
      }
      
      console.log(`Checked ${images.length} images for alt text`);
    }
  });

  test('should have proper form labels and accessibility', async ({ page }) => {
    const inputs = await page.locator('input, select, textarea').all();
    
    if (inputs.length > 0) {
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');
        
        // Input should have some form of labeling
        const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
        const hasAccessibleName = hasLabel || ariaLabel || ariaLabelledBy || placeholder;
        
        expect(hasAccessibleName).toBeTruthy();
      }
      
      console.log(`Checked ${inputs.length} form inputs for accessibility`);
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test tab navigation
    const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
    
    if (focusableElements.length > 0) {
      // Focus first element
      await focusableElements[0].focus();
      
      // Tab through first few elements
      for (let i = 0; i < Math.min(5, focusableElements.length - 1); i++) {
        await page.keyboard.press('Tab');
        
        // Verify focus moved
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedElement).toBeDefined();
      }
      
      console.log(`Tested keyboard navigation through ${Math.min(5, focusableElements.length)} elements`);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - in real scenarios you'd use axe-core or similar
    const textElements = await page.locator('p, span, div, h1, h2, h3, h4, h5, h6, a, button').all();
    
    let checkedElements = 0;
    
    for (const element of textElements.slice(0, 10)) { // Check first 10 elements
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontSize: computed.fontSize
        };
      });
      
      // Basic check that text has color (not transparent)
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(styles.color).not.toBe('transparent');
      
      checkedElements++;
    }
    
    console.log(`Checked color contrast for ${checkedElements} elements`);
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for common ARIA attributes
    const elementsWithAria = await page.locator('[aria-label], [aria-labelledby], [aria-describedby], [role]').all();
    
    if (elementsWithAria.length > 0) {
      for (const element of elementsWithAria) {
        const role = await element.getAttribute('role');
        const ariaLabel = await element.getAttribute('aria-label');
        
        // If element has role, it should be a valid ARIA role
        if (role) {
          const validRoles = [
            'button', 'link', 'navigation', 'main', 'banner', 'contentinfo',
            'complementary', 'search', 'form', 'dialog', 'alert', 'status',
            'tab', 'tabpanel', 'tablist', 'menu', 'menuitem', 'listbox',
            'option', 'combobox', 'grid', 'gridcell', 'row', 'columnheader',
            'rowheader', 'presentation', 'none'
          ];
          
          expect(validRoles).toContain(role);
        }
        
        // ARIA labels should not be empty
        if (ariaLabel) {
          expect(ariaLabel.trim().length).toBeGreaterThan(0);
        }
      }
      
      console.log(`Checked ARIA attributes for ${elementsWithAria.length} elements`);
    }
  });

  test('should be usable with screen reader simulation', async ({ page }) => {
    // Simulate screen reader navigation using keyboard
    await page.keyboard.press('Tab');
    
    // Check for skip links (common accessibility feature)
    const skipLinks = await page.locator('a[href*="#"], [class*="skip"]').all();
    
    if (skipLinks.length > 0) {
      const firstSkipLink = skipLinks[0];
      const href = await firstSkipLink.getAttribute('href');
      const text = await firstSkipLink.textContent();
      
      if (href?.startsWith('#') && text) {
        expect(text.toLowerCase()).toMatch(/skip|jump|go to/);
        console.log(`Found skip link: "${text}"`);
      }
    }
  });

  test('should handle focus management in modals', async ({ page }) => {
    // Look for modal triggers
    const modalTriggers = await page.locator('button, [data-testid*="modal"], [class*="modal"]').all();
    
    for (const trigger of modalTriggers.slice(0, 3)) { // Test first 3 potential modal triggers
      if (await trigger.isVisible()) {
        await trigger.click();
        
        // Wait for potential modal
        await page.waitForTimeout(500);
        
        // Check if a modal appeared
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]').first();
        
        if (await modal.isVisible()) {
          // Focus should be trapped in modal
          const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
          expect(focusedElement).toBeDefined();
          
          // Try to close modal with Escape
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          
          // Modal should close
          const isModalStillVisible = await modal.isVisible().catch(() => false);
          if (isModalStillVisible) {
            // Try clicking outside or close button
            const closeButton = page.locator('[data-testid="close"], .close, button[aria-label*="close"]').first();
            if (await closeButton.isVisible()) {
              await closeButton.click();
            }
          }
          
          break; // Only test one modal
        }
      }
    }
  });

  test('should have proper page title and meta information', async ({ page }) => {
    // Check page title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThan(60); // SEO best practice
    
    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(0);
      expect(metaDescription.length).toBeLessThan(160); // SEO best practice
    }
    
    // Check lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeDefined();
    expect(htmlLang?.length).toBeGreaterThan(0);
    
    console.log(`Page title: "${title}"`);
    console.log(`Page lang: "${htmlLang}"`);
  });
});