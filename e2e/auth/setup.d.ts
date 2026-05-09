import path from 'path';
import { test as setup } from '@playwright/test';
import { authenticateUser, AUTH_DIR } from './shared';

setup('authenticate D User1 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'd-user1.json'), baseURL ?? '');
});
