import type { Model } from '@/entities/current-partyroom/model/crew.model';
import { GradeType, MotionType } from '@/shared/api/http/types/@enums';

// barrel export에 JSX 포함된 훅이 있어 직접 모듈 경로로 모킹
jest.mock('@/entities/current-partyroom', () => ({
  Crew: jest.requireActual('@/entities/current-partyroom/model/crew.model'),
}));

import { categorizeByGradeType } from './crews.model';

const createCrew = (overrides: Partial<Model> = {}): Model => ({
  crewId: 1,
  nickname: 'tester',
  gradeType: GradeType.CLUBBER,
  avatarBodyUri: '',
  avatarFaceUri: '',
  avatarIconUri: '',
  combinePositionX: 0,
  combinePositionY: 0,
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  motionType: MotionType.NONE,
  ...overrides,
});

describe('crews model', () => {
  describe('categorizeByGradeType', () => {
    test('등급별로 크루를 분류', () => {
      const crews = [
        createCrew({ crewId: 1, gradeType: GradeType.HOST }),
        createCrew({ crewId: 2, gradeType: GradeType.CLUBBER }),
        createCrew({ crewId: 3, gradeType: GradeType.CLUBBER }),
        createCrew({ crewId: 4, gradeType: GradeType.LISTENER }),
      ];

      const result = categorizeByGradeType(crews);

      expect(result[GradeType.HOST]).toHaveLength(1);
      expect(result[GradeType.CLUBBER]).toHaveLength(2);
      expect(result[GradeType.LISTENER]).toHaveLength(1);
    });

    test('해당 등급의 크루가 없으면 키가 없음', () => {
      const crews = [createCrew({ gradeType: GradeType.HOST })];

      const result = categorizeByGradeType(crews);

      expect(result[GradeType.HOST]).toHaveLength(1);
      expect(result[GradeType.MODERATOR]).toBeUndefined();
      expect(result[GradeType.CLUBBER]).toBeUndefined();
    });

    test('빈 배열이면 빈 객체 반환', () => {
      expect(categorizeByGradeType([])).toEqual({});
    });

    test('gradePriorities 순서에 따라 키 순서 보장', () => {
      const crews = [
        createCrew({ crewId: 1, gradeType: GradeType.LISTENER }),
        createCrew({ crewId: 2, gradeType: GradeType.HOST }),
        createCrew({ crewId: 3, gradeType: GradeType.MODERATOR }),
      ];

      const result = categorizeByGradeType(crews);
      const keys = Object.keys(result);

      expect(keys.indexOf(GradeType.HOST)).toBeLessThan(keys.indexOf(GradeType.MODERATOR));
      expect(keys.indexOf(GradeType.MODERATOR)).toBeLessThan(keys.indexOf(GradeType.LISTENER));
    });
  });
});
