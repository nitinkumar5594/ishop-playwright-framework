import { test as baseTest } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

type MyFixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
};

export const test = baseTest.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
});

export { expect } from '@playwright/test';
