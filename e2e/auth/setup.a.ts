import path from 'path';
import { test as setup } from '@playwright/test';
import { authenticateUser, AUTH_DIR } from './shared';

setup('authenticate A User1 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'a-user1.json'), baseURL ?? '');
});

setup('authenticate A User2 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'a-user2.json'), baseURL ?? '');
});
