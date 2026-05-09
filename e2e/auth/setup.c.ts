import path from 'path';
import { test as setup } from '@playwright/test';
import { authenticateUser, AUTH_DIR } from './shared';

setup('authenticate C User1 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'c-user1.json'), baseURL ?? '');
});

setup('authenticate C User2 (full crew)', async ({ browser, baseURL }) => {
  await authenticateUser(browser, path.join(AUTH_DIR, 'c-user2.json'), baseURL ?? '');
});
