import { PenaltyType } from '@/shared/api/http/types/@enums';
import type { BlockedCrew } from '@/shared/api/http/types/crews';
import type { Penalty } from '@/shared/api/http/types/partyrooms';
import {
  getCategoryLabel,
  listOfPenalties,
  listOfMyBlockedCrews,
  categorize,
} from './restriction-panel-list-item.model';

const mockDictionary = { auth: { para: { penalty: '패널티', block: '차단' } } } as any;

const createPenalty = (overrides: Partial<Penalty> = {}): Penalty => ({
  penaltyId: 1,
  penaltyType: PenaltyType.PERMANENT_EXPULSION,
  crewId: 100,
  avatarIconUri: 'https://example.com/avatar.png',
  nickname: 'testUser',
  ...overrides,
});

const createBlockedCrew = (overrides: Partial<BlockedCrew> = {}): BlockedCrew => ({
  blockId: 1,
  blockedCrewId: 200,
  nickname: 'blockedUser',
  avatarIconUri: 'https://example.com/blocked-avatar.png',
  ...overrides,
});

describe('restriction-panel-list-item model', () => {
  describe('getCategoryLabel', () => {
    test('PERMANENT_EXPULSION 카테고리는 penalty 라벨 반환', () => {
      expect(getCategoryLabel('PERMANENT_EXPULSION', mockDictionary)).toBe('패널티');
    });

    test('BLOCK 카테고리는 block 라벨 반환', () => {
      expect(getCategoryLabel('BLOCK', mockDictionary)).toBe('차단');
    });

    test('알 수 없는 카테고리는 빈 문자열 반환', () => {
      expect(getCategoryLabel('UNKNOWN', mockDictionary)).toBe('');
    });
  });

  describe('listOfPenalties', () => {
    test('Penalty 배열을 Model 배열로 변환하고 PERMANENT_EXPULSION 카테고리 매핑', () => {
      const penalties = [
        createPenalty({ penaltyId: 1, crewId: 10, nickname: 'user1' }),
        createPenalty({ penaltyId: 2, crewId: 20, nickname: 'user2' }),
      ];
      const suffixRender = vi.fn(() => 'suffix');

      const result = listOfPenalties(penalties, suffixRender);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        category: 'PERMANENT_EXPULSION',
        crewId: 10,
        avatarIconUri: 'https://example.com/avatar.png',
        nickname: 'user1',
        suffix: 'suffix',
      });
      expect(result[1].crewId).toBe(20);
      expect(suffixRender).toHaveBeenCalledTimes(2);
      expect(suffixRender).toHaveBeenCalledWith(penalties[0]);
      expect(suffixRender).toHaveBeenCalledWith(penalties[1]);
    });

    test('PERMANENT_EXPULSION이 아닌 PenaltyType은 빈 문자열 카테고리로 매핑', () => {
      const penalties = [
        createPenalty({ penaltyType: PenaltyType.ONE_TIME_EXPULSION }),
        createPenalty({ penaltyType: PenaltyType.CHAT_BAN_30_SECONDS }),
      ];
      const suffixRender = vi.fn(() => 'suffix');

      const result = listOfPenalties(penalties, suffixRender);

      expect(result[0].category).toBe('');
      expect(result[1].category).toBe('');
    });
  });

  describe('listOfMyBlockedCrews', () => {
    test('BlockedCrew 배열을 BLOCK 카테고리의 Model 배열로 변환', () => {
      const blockedCrews = [
        createBlockedCrew({ blockId: 1, blockedCrewId: 301, nickname: 'blocked1' }),
        createBlockedCrew({ blockId: 2, blockedCrewId: 302, nickname: 'blocked2' }),
      ];
      const suffixRender = vi.fn(() => 'suffix');

      const result = listOfMyBlockedCrews(blockedCrews, suffixRender);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        category: 'BLOCK',
        crewId: 301,
        avatarIconUri: 'https://example.com/blocked-avatar.png',
        nickname: 'blocked1',
        suffix: 'suffix',
      });
      expect(result[1].category).toBe('BLOCK');
      expect(result[1].crewId).toBe(302);
      expect(suffixRender).toHaveBeenCalledTimes(2);
      expect(suffixRender).toHaveBeenCalledWith(blockedCrews[0]);
    });
  });

  describe('categorize', () => {
    test('카테고리별로 그룹화하고 [PERMANENT_EXPULSION, BLOCK] 순서 유지', () => {
      const models = [
        { category: 'BLOCK', crewId: 1, avatarIconUri: '', nickname: 'a', suffix: null },
        {
          category: 'PERMANENT_EXPULSION',
          crewId: 2,
          avatarIconUri: '',
          nickname: 'b',
          suffix: null,
        },
        {
          category: 'PERMANENT_EXPULSION',
          crewId: 3,
          avatarIconUri: '',
          nickname: 'c',
          suffix: null,
        },
        { category: 'BLOCK', crewId: 4, avatarIconUri: '', nickname: 'd', suffix: null },
      ];

      const result = categorize(models);

      const keys = Object.keys(result);
      expect(keys).toEqual(['PERMANENT_EXPULSION', 'BLOCK']);
      expect(result['PERMANENT_EXPULSION']).toHaveLength(2);
      expect(result['BLOCK']).toHaveLength(2);
      expect(result['PERMANENT_EXPULSION'][0].crewId).toBe(2);
      expect(result['PERMANENT_EXPULSION'][1].crewId).toBe(3);
    });

    test('단일 카테고리만 있을 때 해당 카테고리만 포함', () => {
      const models = [
        { category: 'BLOCK', crewId: 1, avatarIconUri: '', nickname: 'a', suffix: null },
        { category: 'BLOCK', crewId: 2, avatarIconUri: '', nickname: 'b', suffix: null },
      ];

      const result = categorize(models);

      const keys = Object.keys(result);
      expect(keys).toEqual(['BLOCK']);
      expect(result['BLOCK']).toHaveLength(2);
      expect(result['PERMANENT_EXPULSION']).toBeUndefined();
    });
  });
});
