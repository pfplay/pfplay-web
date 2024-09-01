import { GradeType } from '@/shared/api/http/types/@enums';

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
export class Permissions {
  private constructor(private comparator: GradeComparator) {}

  public static of(grade: GradeType) {
    return new Permissions(GradeComparator.of(grade));
  }

  public canAdjustGrade(targetGrade: GradeType) {
    return (
      this.comparator.isHigherThan(GradeType.MODERATOR) && this.comparator.isHigherThan(targetGrade)
    );
  }

  public adjustableGrades() {
    return this.comparator.lowerGrades;
  }

  public canRemoveChatMessage() {
    throw new Error('Not Impl yet');
  }

  public canMute() {
    throw new Error('Not Impl yet');
  }

  public canKick() {
    throw new Error('Not Impl yet');
  }

  public canBan() {
    throw new Error('Not Impl yet');
  }

  public canSkipPlayback() {
    return this.comparator.isHigherThan(GradeType.MODERATOR);
  }

  public canLockDjingQueue() {
    throw new Error('Not Impl yet');
  }

  public canRegisterDj() {
    throw new Error('Not Impl yet');
  }

  public canUnregisterDj() {
    throw new Error('Not Impl yet');
  }
}

class GradeComparator {
  private gradePriorities = Object.freeze<GradeType[]>([
    GradeType.HOST,
    GradeType.COMMUNITY_MANAGER,
    GradeType.MODERATOR,
    GradeType.CLUBBER,
    GradeType.LISTENER,
  ]);

  private constructor(private base: GradeType) {}

  public static of(base: GradeType) {
    return new GradeComparator(base);
  }

  public isHigherThan(target: GradeType) {
    return this.compareGradePriority(this.base, target) === 1;
  }

  public isLowerThan(target: GradeType) {
    return this.compareGradePriority(this.base, target) === -1;
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
