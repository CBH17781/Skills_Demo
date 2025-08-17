/**
 * Test Configuration for LI.FI E2E Tests
 * Contains shared settings and options for Playwright and other test runners.
 * Adjust values here to change test behavior globally.
 */
/**
 * Test Configuration
 * Environment-specific settings and test data management
 */

export const TestConfig = {
  // Environment URLs
  environments: {
    production: 'https://li.fi',
    staging: 'https://staging.li.fi',
    development: 'https://dev.li.fi',
    local: 'http://localhost:3000'
  },

  // API endpoints
  api: {
    baseUrl: 'https://li.quest/v1',
    endpoints: {
      chains: '/chains',
      tokens: '/tokens',
      quote: '/quote',
      routes: '/routes',
      status: '/status'
    }
  },

  // Test timeouts (in milliseconds)
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
    api: 15000,
    pageLoad: 30000
  },

  // Performance thresholds
  performance: {
    pageLoadTime: 5000,        // 5 seconds max
    apiResponseTime: 3000,     // 3 seconds max
    lcp: 2500,                 // Largest Contentful Paint
    fid: 100,                  // First Input Delay
    cls: 0.1                   // Cumulative Layout Shift
  },

  // Browser configurations
  browsers: {
    desktop: {
      chromium: {
        name: 'chromium',
        viewport: { width: 1920, height: 1080 }
      },
      firefox: {
        name: 'firefox',
        viewport: { width: 1920, height: 1080 }
      },
      webkit: {
        name: 'webkit',
        viewport: { width: 1920, height: 1080 }
      }
    },
    mobile: {
      pixel5: {
        name: 'Pixel 5',
        viewport: { width: 393, height: 851 },
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36'
      },
      iphone12: {
        name: 'iPhone 12',
        viewport: { width: 390, height: 844 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      }
    }
  },

  // Test data for DeFi operations
  testData: {
    // Ethereum mainnet token addresses
    tokens: {
      ETH: {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'ETH',
        decimals: 18,
        name: 'Ethereum'
      },
      USDC: {
        address: '0xA0b86a33E6441b8e8C7C7b0b2C4C2e4B4b4b4b4b',
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin'
      },
      USDT: {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        decimals: 6,
        name: 'Tether USD'
      },
      WBTC: {
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        symbol: 'WBTC',
        decimals: 8,
        name: 'Wrapped Bitcoin'
      }
    },

    // Blockchain networks
    networks: {
      ethereum: {
        id: '1',
        name: 'Ethereum',
        rpcUrl: 'https://mainnet.infura.io/v3/',
        blockExplorer: 'https://etherscan.io'
      },
      polygon: {
        id: '137',
        name: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorer: 'https://polygonscan.com'
      },
      arbitrum: {
        id: '42161',
        name: 'Arbitrum One',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        blockExplorer: 'https://arbiscan.io'
      },
      optimism: {
        id: '10',
        name: 'Optimism',
        rpcUrl: 'https://mainnet.optimism.io',
        blockExplorer: 'https://optimistic.etherscan.io'
      }
    },

    // Test amounts in different units
    amounts: {
      wei: {
        small: '100000000000000000',    // 0.1 ETH
        medium: '1000000000000000000',   // 1 ETH
        large: '10000000000000000000'    // 10 ETH
      },
      ether: {
        small: '0.1',
        medium: '1.0',
        large: '10.0'
      },
      usd: {
        small: '100',
        medium: '1000',
        large: '10000'
      }
    },

    // Wallet addresses for testing (test addresses only)
    wallets: {
      test1: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4b4b4',
      test2: '0x8ba1f109551bD432803012645Hac136c22C4b4b4',
      // Note: These are example addresses, not real wallets
    },

    // Common slippage tolerances
    slippage: {
      low: '0.1',      // 0.1%
      medium: '0.5',   // 0.5%
      high: '1.0',     // 1.0%
      extreme: '5.0'   // 5.0%
    }
  },

  // Accessibility testing configuration
  accessibility: {
    standards: ['wcag2a', 'wcag2aa', 'wcag21aa'],
    rules: {
      'color-contrast': 'error',
      'keyboard-navigation': 'error',
      'alt-text': 'error',
      'heading-order': 'warn',
      'form-labels': 'error'
    }
  },

  // Security testing configuration
  security: {
    headers: {
      required: [
        'x-frame-options',
        'x-content-type-options',
        'strict-transport-security'
      ],
      recommended: [
        'content-security-policy',
        'x-xss-protection',
        'referrer-policy'
      ]
    },
    vulnerabilities: {
      xss: [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '"><script>alert("XSS")</script>',
        "'; alert('XSS'); //",
        '<img src=x onerror=alert("XSS")>'
      ],
      sqlInjection: [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "1' UNION SELECT * FROM users--",
        "admin'--",
        "' OR 1=1--"
      ],
      pathTraversal: [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
        '....//....//....//etc/passwd'
      ]
    }
  },

  // API testing configuration
  apiTesting: {
    rateLimit: {
      requestsPerMinute: 60,
      burstLimit: 10
    },
    responseValidation: {
      maxResponseTime: 3000,
      requiredHeaders: ['content-type', 'cache-control'],
      allowedStatusCodes: [200, 201, 400, 401, 403, 404, 429, 500, 502, 503]
    }
  },

  // Test reporting configuration
  reporting: {
    formats: ['html', 'json', 'junit'],
    screenshots: {
      mode: 'only-on-failure',
      fullPage: true
    },
    videos: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    traces: {
      mode: 'on-first-retry',
      screenshots: true,
      snapshots: true
    }
  },

  // CI/CD specific configuration
  ci: {
    retries: 2,
    workers: 1,
    timeout: 60000,
    parallel: true,
    failFast: false
  }
};

// Environment-specific overrides
export const getEnvironmentConfig = (env = 'production') => {
  const baseConfig = { ...TestConfig };
  
  switch (env) {
    case 'development':
      baseConfig.timeouts.pageLoad = 60000; // Slower dev environment
      baseConfig.performance.pageLoadTime = 10000;
      break;
      
    case 'staging':
      baseConfig.timeouts.pageLoad = 45000;
      baseConfig.performance.pageLoadTime = 7500;
      break;
      
    case 'ci':
      baseConfig.ci.retries = 3;
      baseConfig.timeouts.pageLoad = 45000;
      baseConfig.performance.pageLoadTime = 8000;
      break;
      
    default:
      // Production settings (already set in base config)
      break;
  }
  
  return baseConfig;
};

// Utility functions for test configuration
export const ConfigUtils = {
  /**
   * Get current environment from environment variables
   */
  getCurrentEnvironment() {
    return process.env.TEST_ENV || process.env.NODE_ENV || 'production';
  },

  /**
   * Get base URL for current environment
   */
  getBaseUrl(env) {
    const config = getEnvironmentConfig(env);
    return config.environments[env] || config.environments.production;
  },

  /**
   * Check if running in CI environment
   */
  isCI() {
    return !!process.env.CI;
  },

  /**
   * Get timeout for specific operation
   */
  getTimeout(operation) {
    const env = this.getCurrentEnvironment();
    const config = getEnvironmentConfig(env);
    return config.timeouts[operation] || config.timeouts.medium;
  },

  /**
   * Get performance threshold for metric
   */
  getPerformanceThreshold(metric) {
    const env = this.getCurrentEnvironment();
    const config = getEnvironmentConfig(env);
    return config.performance[metric];
  },

  /**
   * Get test data for specific category
   */
  getTestData(category) {
    return TestConfig.testData[category] || {};
  },

  /**
   * Generate random test data
   */
  generateRandomAmount(min = 0.1, max = 10.0) {
    return (Math.random() * (max - min) + min).toFixed(6);
  },

  /**
   * Validate Ethereum address format
   */
  isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  /**
   * Convert amount to wei
   */
  toWei(amount, decimals = 18) {
    return (parseFloat(amount) * Math.pow(10, decimals)).toString();
  },

  /**
   * Convert wei to readable amount
   */
  fromWei(wei, decimals = 18) {
    return (parseInt(wei) / Math.pow(10, decimals)).toString();
  }
};

export default TestConfig;