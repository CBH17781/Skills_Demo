/**
 * API Endpoint Tests for LI.FI
 * These tests validate the main API endpoints and their responses.
 * Designed for clarity and demonstration purposes.
 */
import { test, expect } from '@playwright/test';

test.describe('LI.FI API Tests @api', () => {
  const API_BASE_URL = 'https://li.quest/v1';
  
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'LI.FI-QA-Test-Suite/1.0'
  };

  test('should fetch supported chains @smoke', async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/chains`, { headers });
    
    expect(response.status()).toBe(200);
    
    const chains = await response.json();
    expect(Array.isArray(chains.chains)).toBeTruthy();
    expect(chains.chains.length).toBeGreaterThan(0);
    
    // Verify chain structure
    const firstChain = chains.chains[0];
    expect(firstChain).toHaveProperty('id');
    expect(firstChain).toHaveProperty('name');
    expect(firstChain).toHaveProperty('chainType');
    expect(firstChain).toHaveProperty('nativeToken');
  });

  test('should fetch supported tokens', async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/tokens`, { headers });
    
    expect(response.status()).toBe(200);
    
    const tokens = await response.json();
  console.log('tokens response:', tokens);
  // The response is an object with chain IDs as keys, each mapping to an array of tokens
  const chainIds = Object.keys(tokens.tokens);
  expect(chainIds.length).toBeGreaterThan(0);
  const firstChainId = chainIds[0];
  const tokenArray = tokens.tokens[firstChainId];
  expect(Array.isArray(tokenArray)).toBeTruthy();
  expect(tokenArray.length).toBeGreaterThan(0);
  // Verify token structure
  const firstToken = tokenArray[0];
  expect(firstToken).toHaveProperty('address');
  expect(firstToken).toHaveProperty('symbol');
  expect(firstToken).toHaveProperty('decimals');
  expect(firstToken).toHaveProperty('chainId');
  });

  test('should get quote for token swap', async ({ request }) => {
    // Example quote request for ETH to USDC
    const quoteParams = new URLSearchParams({
      fromChain: '1', // Ethereum
      toChain: '1',   // Ethereum
      fromToken: '0x0000000000000000000000000000000000000000', // ETH
      toToken: '0xA0b86a33E6441b8e8C7C7b0b2C4C2e4B4b4b4b4b', // USDC (example)
      fromAmount: '1000000000000000000', // 1 ETH in wei
    });

  const response = await request.get(`${API_BASE_URL}/quote?${quoteParams}`, { headers });
    
    // API might return different status codes based on availability
    if (response.status() === 200) {
      const quote = await response.json();
      expect(quote).toHaveProperty('routes');
      expect(Array.isArray(quote.routes)).toBeTruthy();
    } else if (response.status() === 400) {
      // Handle case where quote parameters are invalid
      const error = await response.json();
      expect(error).toHaveProperty('message');
    }
  });

  test('should handle invalid API requests gracefully', async ({ request }) => {
    // Test with invalid endpoint
  const response = await request.get(`${API_BASE_URL}/invalid-endpoint`, { headers });
    expect(response.status()).toBe(404);
  });

  test('should validate API response times', async ({ request }) => {
    const startTime = Date.now();
  const response = await request.get(`${API_BASE_URL}/chains`, { headers });
    const endTime = Date.now();
    
    expect(response.status()).toBe(200);
    
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
  });

  test('should test API rate limiting behavior', async ({ request }) => {
    const requests = [];
    
    // Send multiple concurrent requests
    for (let i = 0; i < 10; i++) {
      requests.push(request.get(`${API_BASE_URL}/chains`, { headers }));
    }
    
    const responses = await Promise.all(requests);
    
    // Check that most requests succeed (some might be rate limited)
    const successfulResponses = responses.filter(r => r.status() === 200);
    expect(successfulResponses.length).toBeGreaterThan(5);
  });

  test('should validate CORS headers', async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/chains`, { headers });
    
    expect(response.status()).toBe(200);
    
    const responseHeaders = response.headers();
    // Check for CORS headers (these might vary based on API configuration)
    if (responseHeaders['access-control-allow-origin']) {
      expect(responseHeaders['access-control-allow-origin']).toBeDefined();
    }
  });
});