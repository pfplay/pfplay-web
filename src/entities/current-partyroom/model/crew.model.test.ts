import { GradeType } from '@/shared/api/http/types/@enums';
import { GradeComparator, Permission } from './crew.model';

// of()가 undefined를 반환할 수 있는 타입이므로, 테스트에서 타입 단언용 헬퍼
const comparator = (base: GradeType) => GradeComparator.of(base) as GradeComparator;
const perm = (base: GradeType) => Permission.of(base) as Permission;

describe('GradeComparator', () => {
  beforeEach(() => {
    // @ts-expect-error private 접근 — 싱글톤 캐시 초기화
    GradeComparator.instances = {};
  });

  describe('isHigherThan', () => {
    it.each([
      [GradeType.HOST, GradeType.MODERATOR, true],
      [GradeType.CLUBBER, GradeType.LISTENER, true],
      [GradeType.MODERATOR, GradeType.MODERATOR, false],
      [GradeType.LISTENER, GradeType.HOST, false],
      [GradeType.CLUBBER, GradeType.MODERATOR, false],
    ])('%s > %s → %s', (base, target, expected) => {
      expect(comparator(base).isHigherThan(target)).toBe(expected);
    });
  });

  describe('isHigherThanOrEqualTo', () => {
    it.each([
      [GradeType.HOST, GradeType.HOST, true],
      [GradeType.MODERATOR, GradeType.MODERATOR, true],
      [GradeType.HOST, GradeType.MODERATOR, true],
      [GradeType.LISTENER, GradeType.HOST, false],
    ])('%s >= %s → %s', (base, target, expected) => {
      expect(comparator(base).isHigherThanOrEqualTo(target)).toBe(expected);
    });
  });

  describe('isLowerThan', () => {
    it.each([
      [GradeType.LISTENER, GradeType.HOST, true],
      [GradeType.CLUBBER, GradeType.MODERATOR, true],
      [GradeType.MODERATOR, GradeType.MODERATOR, false],
      [GradeType.HOST, GradeType.LISTENER, false],
    ])('%s < %s → %s', (base, target, expected) => {
      expect(comparator(base).isLowerThan(target)).toBe(expected);
    });
  });

  describe('isLowerThanOrEqualTo', () => {
    it.each([
      [GradeType.LISTENER, GradeType.HOST, true],
      [GradeType.MODERATOR, GradeType.MODERATOR, true],
      [GradeType.HOST, GradeType.LISTENER, false],
    ])('%s <= %s → %s', (base, target, expected) => {
      expect(comparator(base).isLowerThanOrEqualTo(target)).toBe(expected);
    });
  });

  describe('higherGrades', () => {
    test('MODERATOR보다 높은 등급 반환', () => {
      expect(comparator(GradeType.MODERATOR).higherGrades).toEqual([
        GradeType.HOST,
        GradeType.COMMUNITY_MANAGER,
      ]);
    });

    test('HOST보다 높은 등급은 없음', () => {
      expect(comparator(GradeType.HOST).higherGrades).toEqual([]);
    });
  });

  describe('lowerGrades', () => {
    test('MODERATOR보다 낮은 등급 반환', () => {
      expect(comparator(GradeType.MODERATOR).lowerGrades).toEqual([
        GradeType.CLUBBER,
        GradeType.LISTENER,
      ]);
    });

    test('LISTENER보다 낮은 등급은 없음', () => {
      expect(comparator(GradeType.LISTENER).lowerGrades).toEqual([]);
    });
  });

  describe('싱글톤 캐싱', () => {
    test('같은 등급으로 of() 호출 시 동일 인스턴스 반환', () => {
      const a = GradeComparator.of(GradeType.MODERATOR);
      const b = GradeComparator.of(GradeType.MODERATOR);
      expect(a).toBe(b);
    });
  });
});

describe('Permission', () => {
  beforeEach(() => {
    // @ts-expect-error private 접근
    Permission.instances = {};
    // @ts-expect-error private 접근
    GradeComparator.instances = {};
  });

  describe('canAdjustGrade', () => {
    it.each([
      [GradeType.HOST, GradeType.MODERATOR, true],
      [GradeType.MODERATOR, GradeType.CLUBBER, true],
      [GradeType.MODERATOR, GradeType.MODERATOR, false],
      [GradeType.CLUBBER, GradeType.LISTENER, false],
      [GradeType.LISTENER, GradeType.CLUBBER, false],
    ])('%s가 %s 등급 조정 → %s', (base, target, expected) => {
      expect(perm(base).canAdjustGrade(target)).toBe(expected);
    });
  });

  describe('canRemoveChatMessage', () => {
    it.each([
      [GradeType.HOST, GradeType.CLUBBER, true],
      [GradeType.MODERATOR, GradeType.LISTENER, true],
      [GradeType.MODERATOR, GradeType.MODERATOR, false],
      [GradeType.CLUBBER, GradeType.LISTENER, false],
    ])('%s가 %s 채팅 삭제 → %s', (base, target, expected) => {
      expect(perm(base).canRemoveChatMessage(target)).toBe(expected);
    });
  });

  describe('MODERATOR 이상이면 true인 권한들', () => {
    const moderatorOrAbove = [GradeType.HOST, GradeType.COMMUNITY_MANAGER, GradeType.MODERATOR];
    const belowModerator = [GradeType.CLUBBER, GradeType.LISTENER];

    it.each(moderatorOrAbove)('%s는 canViewPenalties true', (grade) => {
      expect(perm(grade).canViewPenalties()).toBe(true);
    });

    it.each(belowModerator)('%s는 canViewPenalties false', (grade) => {
      expect(perm(grade).canViewPenalties()).toBe(false);
    });

    it.each(moderatorOrAbove)('%s는 canSkipPlayback true', (grade) => {
      expect(perm(grade).canSkipPlayback()).toBe(true);
    });

    it.each(belowModerator)('%s는 canSkipPlayback false', (grade) => {
      expect(perm(grade).canSkipPlayback()).toBe(false);
    });

    it.each(moderatorOrAbove)('%s는 canLockDjingQueue true', (grade) => {
      expect(perm(grade).canLockDjingQueue()).toBe(true);
    });

    it.each(belowModerator)('%s는 canLockDjingQueue false', (grade) => {
      expect(perm(grade).canLockDjingQueue()).toBe(false);
    });

    it.each(moderatorOrAbove)('%s는 canUnlockDjingQueue true', (grade) => {
      expect(perm(grade).canUnlockDjingQueue()).toBe(true);
    });

    it.each(belowModerator)('%s는 canUnlockDjingQueue false', (grade) => {
      expect(perm(grade).canUnlockDjingQueue()).toBe(false);
    });

    it.each(moderatorOrAbove)('%s는 canDeleteDjFromQueue true', (grade) => {
      expect(perm(grade).canDeleteDjFromQueue()).toBe(true);
    });

    it.each(belowModerator)('%s는 canDeleteDjFromQueue false', (grade) => {
      expect(perm(grade).canDeleteDjFromQueue()).toBe(false);
    });
  });

  describe('HOST만 true인 권한들', () => {
    test('HOST는 canEdit true', () => {
      expect(perm(GradeType.HOST).canEdit()).toBe(true);
    });

    it.each([
      GradeType.COMMUNITY_MANAGER,
      GradeType.MODERATOR,
      GradeType.CLUBBER,
      GradeType.LISTENER,
    ])('%s는 canEdit false', (grade) => {
      expect(perm(grade).canEdit()).toBe(false);
    });

    test('HOST는 canClose true', () => {
      expect(perm(GradeType.HOST).canClose()).toBe(true);
    });

    it.each([
      GradeType.COMMUNITY_MANAGER,
      GradeType.MODERATOR,
      GradeType.CLUBBER,
      GradeType.LISTENER,
    ])('%s는 canClose false', (grade) => {
      expect(perm(grade).canClose()).toBe(false);
    });
  });

  describe('미구현 메서드 Error throw', () => {
    test('canRegisterDj 호출 시 에러 발생', () => {
      expect(() => perm(GradeType.HOST).canRegisterDj()).toThrow('Not Impl yet');
    });

    test('canUnregisterDj 호출 시 에러 발생', () => {
      expect(() => perm(GradeType.HOST).canUnregisterDj()).toThrow('Not Impl yet');
    });
  });

  describe('adjustableGrades', () => {
    test('HOST의 adjustableGrades는 자기보다 낮은 모든 등급', () => {
      expect(perm(GradeType.HOST).adjustableGrades).toEqual([
        GradeType.COMMUNITY_MANAGER,
        GradeType.MODERATOR,
        GradeType.CLUBBER,
        GradeType.LISTENER,
      ]);
    });

    test('MODERATOR의 adjustableGrades는 CLUBBER, LISTENER', () => {
      expect(perm(GradeType.MODERATOR).adjustableGrades).toEqual([
        GradeType.CLUBBER,
        GradeType.LISTENER,
      ]);
    });
  });

  describe('싱글톤 캐싱', () => {
    test('같은 등급으로 of() 호출 시 동일 인스턴스 반환', () => {
      const a = Permission.of(GradeType.HOST);
      const b = Permission.of(GradeType.HOST);
      expect(a).toBe(b);
    });
  });
});
