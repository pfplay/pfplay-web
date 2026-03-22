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
