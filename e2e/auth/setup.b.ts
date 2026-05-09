import path from 'path';
import { test as setup } from '@playwright/test';
import { authenticateUser, AUTH_DIR } from './shared';

setup('authenticate B User1 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'b-user1.json'), baseURL ?? '');
});

setup('authenticate B User2 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'b-user2.json'), baseURL ?? '');
});
