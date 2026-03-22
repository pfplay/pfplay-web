import type { Me } from '@/entities/me';
import { ActivityType, AuthorityTier, ObtainmentType } from '@/shared/api/http/types/@enums';
import type { AvatarBody } from '@/shared/api/http/types/users';
import { locked } from './avatar-body.model';

const createMe = (overrides: Partial<Me.Model> = {}): Me.Model => ({
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

const createBody = (overrides: Partial<AvatarBody> = {}): AvatarBody => ({
  id: 1,
  name: 'body1',
  resourceUri: '/body.png',
  available: true,
  obtainableType: ObtainmentType.BASIC,
  obtainableScore: 0,
  combinable: true,
  defaultSetting: false,
  ...overrides,
});

const mockDictionary = {
  common: {
    para: {
      'points_to_unlock\t': '{{points}} 포인트가 필요합니다',
    },
  },
} as any;

describe('avatar-body model', () => {
  describe('locked', () => {
    test('me가 undefined이면 잠김', () => {
      const body = createBody();
      const result = locked(body, undefined, mockDictionary);
      expect(result).toEqual({ is: true });
    });

    test('BASIC 타입은 항상 잠기지 않음', () => {
      const body = createBody({ obtainableType: ObtainmentType.BASIC });
      const me = createMe();
      const result = locked(body, me, mockDictionary);
      expect(result).toEqual({ is: false });
    });

    test('DJ_PNT 타입 — 점수 충분하면 잠기지 않음', () => {
      const body = createBody({
        obtainableType: ObtainmentType.DJ_PNT,
        obtainableScore: 100,
      });
      const me = createMe({
        activitySummaries: [{ activityType: ActivityType.DJ_PNT, score: 150 }],
      });
      const result = locked(body, me, mockDictionary);
      expect(result).toEqual({ is: false });
    });

    test('DJ_PNT 타입 — 점수 부족하면 잠김 + reason 포함', () => {
      const body = createBody({
        obtainableType: ObtainmentType.DJ_PNT,
        obtainableScore: 100,
      });
      const me = createMe({
        activitySummaries: [{ activityType: ActivityType.DJ_PNT, score: 30 }],
      });
      const result = locked(body, me, mockDictionary);
      expect(result.is).toBe(true);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('70 DJ');
    });

    test('REF_LINK 타입 — 점수 부족하면 잠김', () => {
      const body = createBody({
        obtainableType: ObtainmentType.REF_LINK,
        obtainableScore: 50,
      });
      const me = createMe({ activitySummaries: [] });
      const result = locked(body, me, mockDictionary);
      expect(result.is).toBe(true);
      expect(result.reason).toContain('50 Refferal Link');
    });

    test('ROOM_ACT 타입 — 점수 동일하면 잠기지 않음', () => {
      const body = createBody({
        obtainableType: ObtainmentType.ROOM_ACT,
        obtainableScore: 200,
      });
      const me = createMe({
        activitySummaries: [{ activityType: ActivityType.ROOM_ACT, score: 200 }],
      });
      const result = locked(body, me, mockDictionary);
      expect(result).toEqual({ is: false });
    });
  });
});
