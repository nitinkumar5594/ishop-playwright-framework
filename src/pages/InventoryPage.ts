import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly title: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('.title');
    this.inventoryItems = page.locator('.inventory_item');
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.title.waitFor({ state: 'visible', timeout: 8000 });
      return true;
    } catch {
      return false;
    }
  }

  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }
}
