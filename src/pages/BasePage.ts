import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(path: string = ''): Promise<void> {
    await this.page.goto(path);
  }

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }
}
