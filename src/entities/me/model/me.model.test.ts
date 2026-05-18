import { ActivityType, AuthorityTier } from '@/shared/api/http/types/@enums';
import type { Model } from './me.model';
import { serviceEntry, score, registrationDate } from './me.model';

const createModel = (overrides: Partial<Model> = {}): Model => ({
  uid: 'test-uid',
  authorityTier: AuthorityTier.FM,
  registrationDate: '2024-06-23',
  profileUpdated: true,
  nickname: 'tester',
  avatarBodyUri: '',
  avatarFaceUri: '',
  avatarIconUri: '',
  activitySummaries: [],
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  ...overrides,
});

describe('me model', () => {
  describe('serviceEntry', () => {
    test('null이면 루트 경로 반환', () => {
      expect(serviceEntry(null)).toBe('/');
    });

    test('프로필 미완성이면 설정 페이지 반환', () => {
      const model = createModel({ profileUpdated: false });
      expect(serviceEntry(model)).toBe('/settings/profile');
    });

    test('프로필 완성이면 파티 목록 반환', () => {
      const model = createModel({ profileUpdated: true });
      expect(serviceEntry(model)).toBe('/parties');
    });

    test('isNewUser=true 면 profileUpdated=true 여도 설정 페이지 강제 (좀비 me 안전망)', () => {
      const model = createModel({ profileUpdated: true });
      expect(serviceEntry(model, true)).toBe('/settings/profile');
    });

    test('isNewUser=false 면 profileUpdated 기준 동작 (기존 회귀)', () => {
      const model = createModel({ profileUpdated: true });
      expect(serviceEntry(model, false)).toBe('/parties');
    });

    test('isNewUser=true 라도 model null 이면 루트 (가드 우선순위)', () => {
      expect(serviceEntry(null, true)).toBe('/');
    });
  });

  describe('score', () => {
    test('activityType이 summaries에 존재하면 해당 score 반환', () => {
      const model = createModel({
        activitySummaries: [
          { activityType: ActivityType.DJ_PNT, score: 150 },
          { activityType: ActivityType.REF_LINK, score: 30 },
        ],
      });
      expect(score(model, ActivityType.DJ_PNT)).toBe(150);
    });

    test('activityType이 summaries에 미존재하면 0 반환', () => {
      const model = createModel({
        activitySummaries: [{ activityType: ActivityType.DJ_PNT, score: 150 }],
      });
      expect(score(model, ActivityType.REF_LINK)).toBe(0);
    });

    test('activitySummaries 빈 배열이면 0 반환', () => {
      const model = createModel({ activitySummaries: [] });
      expect(score(model, ActivityType.DJ_PNT)).toBe(0);
    });
  });

  describe('registrationDate', () => {
    it.each([
      ['2024-06-23', '2024.06.23'],
      ['2023-01-05', '2023.01.05'],
      ['2025-12-31', '2025.12.31'],
    ])('%s → %s', (input, expected) => {
      const model = createModel({ registrationDate: input });
      expect(registrationDate(model)).toBe(expected);
    });
  });
});
