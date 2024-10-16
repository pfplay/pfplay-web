import { GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { PartyroomCrew } from '@/shared/api/http/types/partyrooms';

export type Model = PartyroomCrew & {
  motionType: MotionType;
};

/**
 * 등급에 따른 권한 제어
 * - 타 멤버 등급 조정
 * - 채팅 삭제
 * - 꿀
 * - 킥
 * - 밴
 * - 플레이백 스킵
 * - 디제잉 대기열 잠금
 * - 특정 멤버를 디제이로 등록
 * - 등록된 디제이 해제
 */
export class Permission {
  private constructor(private comparator: GradeComparator) {}

  private static instances: { [key in GradeType]?: Permission } = {};

  public static of(base: GradeType) {
    if (!this.instances[base]) {
      this.instances[base] = new Permission(GradeComparator.of(base));
    }
    return this.instances[base];
  }

  public canAdjustGrade(targetGrade: GradeType) {
    return (
      this.comparator.isHigherThanOrEqualTo(GradeType.MODERATOR) &&
      this.comparator.isHigherThan(targetGrade)
    );
  }

  public get adjustableGrades() {
    return this.comparator.lowerGrades;
  }

  public canRemoveChatMessage(targetGrade: GradeType) {
    return (
      this.comparator.isHigherThanOrEqualTo(GradeType.MODERATOR) &&
      this.comparator.isHigherThan(targetGrade)
    );
  }

  public canImposePenalty(targetGrade: GradeType) {
    return (
      this.comparator.isHigherThanOrEqualTo(GradeType.MODERATOR) &&
      this.comparator.isHigherThan(targetGrade)
    );
  }

  public canSkipPlayback(targetGrade: GradeType) {
    return (
      this.comparator.isHigherThanOrEqualTo(GradeType.MODERATOR) &&
      this.comparator.isHigherThan(targetGrade)
    );
  }

  public canLockDjingQueue() {
    return this.comparator.isHigherThanOrEqualTo(GradeType.MODERATOR);
  }

  public canUnlockDjingQueue() {
    return this.comparator.isHigherThanOrEqualTo(GradeType.MODERATOR);
  }

  public canRegisterDj() {
    throw new Error('Not Impl yet');
  }

  public canUnregisterDj() {
    throw new Error('Not Impl yet');
  }
}

export const gradePriorities = Object.freeze<GradeType[]>([
  GradeType.HOST,
  GradeType.COMMUNITY_MANAGER,
  GradeType.MODERATOR,
  GradeType.CLUBBER,
  GradeType.LISTENER,
]);

export class GradeComparator {
  private gradePriorities = gradePriorities;

  private constructor(private base: GradeType) {}

  private static instances: { [key in GradeType]?: GradeComparator } = {};

  public static of(base: GradeType) {
    if (!this.instances[base]) {
      this.instances[base] = new GradeComparator(base);
    }
    return this.instances[base];
  }

  public isHigherThan(target: GradeType) {
    return this.compareGradePriority(this.base, target) === 1;
  }

  public isHigherThanOrEqualTo(target: GradeType) {
    return this.compareGradePriority(this.base, target) !== -1;
  }

  public isLowerThan(target: GradeType) {
    return this.compareGradePriority(this.base, target) === -1;
  }

  public isLowerThanOrEqualTo(target: GradeType) {
    return this.compareGradePriority(this.base, target) !== 1;
  }

  public get higherGrades() {
    return this.gradePriorities.slice(0, this.gradePriorities.indexOf(this.base));
  }

  public get lowerGrades() {
    return this.gradePriorities.slice(this.gradePriorities.indexOf(this.base) + 1);
  }

  private compareGradePriority(a: GradeType, b: GradeType): 1 | 0 | -1 {
    const aIndex = this.gradePriorities.indexOf(a);
    const bIndex = this.gradePriorities.indexOf(b);

    if (aIndex > bIndex) return -1; // a가 낮은 등급
    if (aIndex < bIndex) return 1; // a가 높은 등급
    return 0;
  }
}
