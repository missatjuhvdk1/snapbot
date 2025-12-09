import { chromium, BrowserContext, Browser, Cookie } from 'playwright';

interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  protocol: string;
}

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  /**
   * Launch browser with stealth configuration and proxy support
   */
  async launchBrowser(
    accountId: string,
    proxy?: ProxyConfig,
    savedCookies?: Cookie[],
  ): Promise<BrowserContext> {
    // Browser launch options
    const launchOptions: any = {
      headless: process.env.BROWSER_HEADLESS === 'true',
      args: [
        '--disable-blink-features=AutomationControlled', // Hide automation
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    };

    // Add proxy if provided
    if (proxy) {
      const proxyUrl = `${proxy.protocol}://${proxy.host}:${proxy.port}`;
      launchOptions.proxy = {
        server: proxyUrl,
        username: proxy.username,
        password: proxy.password,
      };
      console.log(`🔒 Using proxy: ${proxyUrl}`);
    }

    // Launch browser
    this.browser = await chromium.launch(launchOptions);

    // Create isolated browser context with custom viewport
    const contextOptions: any = {
      viewport: this.randomViewport(),
      userAgent: this.randomUserAgent(),
      locale: 'en-US',
      timezoneId: 'America/New_York',
    };

    this.context = await this.browser.newContext(contextOptions);

    // Restore cookies if provided
    if (savedCookies && savedCookies.length > 0) {
      await this.context.addCookies(savedCookies);
      console.log(`🍪 Restored ${savedCookies.length} cookies`);
    }

    // Add stealth scripts to hide automation
    await this.context.addInitScript(() => {
      // Override navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });

    console.log(`✅ Browser context created for account: ${accountId}`);
    return this.context;
  }

  /**
   * Close browser and cleanup
   */
  async closeBrowser(): Promise<void> {
    if (this.context) {
      await this.context.close();
      this.context = null;
    }

    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    console.log('🔒 Browser closed');
  }

  /**
   * Random viewport size to avoid fingerprinting
   */
  private randomViewport(): { width: number; height: number } {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
    ];

    return viewports[Math.floor(Math.random() * viewports.length)];
  }

  /**
   * Random modern user agent
   */
  private randomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }
}
