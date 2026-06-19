import { buildReauthUrl } from './reauthenticate';

describe('buildReauthUrl', () => {
  test('룸 pathname을 returnTo로 인코딩한 /sign-in URL', () => {
    expect(buildReauthUrl('/parties/5')).toBe('/sign-in?returnTo=%2Fparties%2F5');
  });
  test('pathname만 받으므로 휘발성 쿼리(?source=link)는 포함되지 않는다', () => {
    expect(buildReauthUrl('/parties/5')).not.toContain('source');
  });
});
