import type { Dj } from '@/shared/api/http/types/partyrooms';
import { toListItemConfig } from './dj.model';

describe('dj model', () => {
  describe('toListItemConfig', () => {
    test('Dj 모델을 DjListItemUserConfig로 변환', () => {
      const dj: Dj = {
        crewId: 1,
        orderNumber: 1,
        nickname: 'DJ테스트',
        avatarIconUri: '/images/avatar.png',
      };

      expect(toListItemConfig(dj)).toEqual({
        username: 'DJ테스트',
        src: '/images/avatar.png',
      });
    });

    test('빈 문자열 필드도 정상 변환', () => {
      const dj: Dj = {
        crewId: 2,
        orderNumber: 3,
        nickname: '',
        avatarIconUri: '',
      };

      expect(toListItemConfig(dj)).toEqual({
        username: '',
        src: '',
      });
    });
  });
});
