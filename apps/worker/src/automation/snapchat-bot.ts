import { BrowserContext, Page, Cookie } from 'playwright';

// Snapchat selectors (these may need updating as Snapchat changes their UI)
const SELECTORS = {
  // Login page
  loginButton: '[data-testid="login-button"]',
  usernameInput: 'input[name="username"], input[type="text"]',
  passwordInput: 'input[name="password"], input[type="password"]',
  submitButton: 'button[type="submit"]',

  // Upload flow
  uploadButton: '[aria-label="Upload"], [data-testid="upload-button"]',
  fileInput: 'input[type="file"]',
  postButton: 'button:has-text("Post"), button:has-text("Send")',
  captionInput: 'textarea, input[placeholder*="caption"]',
};

interface PostOptions {
  caption?: string;
}

export class SnapchatBot {
  private page: Page | null = null;

  constructor(private context: BrowserContext) {}

  /**
   * Login to Snapchat
   */
  async login(username: string, password: string): Promise<void> {
    this.page = await this.context.newPage();

    try {
      // Navigate to Snapchat login page
      console.log('🌐 Navigating to Snapchat...');
      await this.page.goto('https://accounts.snapchat.com/accounts/login', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });

      await this.randomDelay(2000, 4000);

      // Enter username
      console.log(`👤 Entering username: ${username}`);
      const usernameField = await this.page.waitForSelector(SELECTORS.usernameInput, {
        timeout: 15000,
      });
      await this.typeWithRandomDelays(usernameField, username);

      await this.randomDelay(800, 1500);

      // Enter password
      console.log('🔑 Entering password...');
      const passwordField = await this.page.locator(SELECTORS.passwordInput).first();
      await this.typeWithRandomDelays(passwordField, password);

      await this.randomDelay(1000, 2000);

      // Click login button
      console.log('🚀 Submitting login...');
      await this.page.click(SELECTORS.submitButton);

      // Wait for navigation (either to home or captcha)
      await this.page.waitForNavigation({
        timeout: 30000,
        waitUntil: 'networkidle',
      }).catch(() => {
        console.log('Navigation timeout, checking if logged in...');
      });

      await this.randomDelay(3000, 5000);

      // Check if logged in (you can check for specific elements on the home page)
      const currentUrl = this.page.url();
      console.log(`📍 Current URL: ${currentUrl}`);

      if (currentUrl.includes('login')) {
        throw new Error('Login failed - still on login page');
      }

      console.log('✅ Login successful!');
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Post a video to Snapchat
   */
  async postVideo(videoPath: string, options: PostOptions = {}): Promise<void> {
    if (!this.page) {
      throw new Error('No active page. Please login first.');
    }

    try {
      console.log('📤 Starting video upload...');

      // TODO: Navigate to upload page (URL needs to be determined)
      // For now, we'll use web.snapchat.com (you may need to adjust this)
      await this.page.goto('https://web.snapchat.com', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });

      await this.randomDelay(3000, 5000);

      // Look for upload button or file input
      console.log('🔍 Looking for upload button...');

      // Try to find file input (hidden or visible)
      const fileInput = await this.page.locator('input[type="file"]').first();

      if (fileInput) {
        console.log('📁 Found file input, uploading video...');
        await fileInput.setInputFiles(videoPath);
      } else {
        throw new Error('Could not find file upload input');
      }

      await this.randomDelay(5000, 8000); // Wait for upload

      // Add caption if provided
      if (options.caption) {
        console.log('✍️ Adding caption...');
        const captionField = await this.page.locator(SELECTORS.captionInput).first();
        if (captionField) {
          await this.typeWithRandomDelays(captionField, options.caption);
        }
        await this.randomDelay(1000, 2000);
      }

      // Click post button
      console.log('📮 Clicking post button...');
      await this.page.click(SELECTORS.postButton);

      await this.randomDelay(3000, 5000);

      console.log('✅ Video posted successfully!');
    } catch (error) {
      console.error('❌ Video posting failed:', error);

      // Take screenshot for debugging
      await this.takeScreenshot('error-posting-video');

      throw error;
    }
  }

  /**
   * Get current cookies from the page
   */
  async getCookies(): Promise<Cookie[]> {
    return await this.context.cookies();
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<string> {
    if (!this.page) return '';

    const path = `./screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path, fullPage: true });
    console.log(`📸 Screenshot saved: ${path}`);
    return path;
  }

  /**
   * Type text with random delays to simulate human behavior
   */
  private async typeWithRandomDelays(element: any, text: string): Promise<void> {
    await element.click(); // Focus the element
    await this.randomDelay(100, 300);

    for (const char of text) {
      await element.type(char);
      await this.randomDelay(50, 150); // Random delay between keystrokes
    }
  }

  /**
   * Random delay to simulate human behavior
   */
  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
