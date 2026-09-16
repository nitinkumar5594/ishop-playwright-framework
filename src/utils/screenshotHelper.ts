import { Page, Locator } from '@playwright/test';
import * as path from 'path';

export class ScreenshotHelper {
  static async captureFullPage(page: Page, testName: string): Promise<string> {
    const filename = `${testName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    const targetPath = path.join('test-results', filename);
    await page.screenshot({ path: targetPath, fullPage: true });
    return targetPath;
  }

  static async captureElement(locator: Locator, elementName: string): Promise<string> {
    const filename = `${elementName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    const targetPath = path.join('test-results', filename);
    await locator.screenshot({ path: targetPath });
    return targetPath;
  }
}
