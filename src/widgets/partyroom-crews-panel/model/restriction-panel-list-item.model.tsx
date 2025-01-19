import { ReactNode } from 'react';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { BlockedCrew } from '@/shared/api/http/types/crews';
import { Penalty } from '@/shared/api/http/types/partyrooms';
import { Categorized, categorize as _categorize } from '@/shared/lib/functions/categorize';

export type Model = {
  category: string;
  crewId: number;
  avatarIconUri: string;
  nickname: string;
  suffix: ReactNode;
};

const enum Category {
  PERMANENT_EXPULSION = 'PERMANENT_EXPULSION',
  BLOCK = 'BLOCK',
}

export const getCategoryLabel = (category: string): string => {
  // TODO: i18n
  switch (category) {
    case Category.PERMANENT_EXPULSION:
      // return '영구 패널티';
      return 'Ban (No re-entry allowed)';
    case Category.BLOCK:
      // return '차단';
      return 'A list I blocked';
    default:
      return '';
  }
};

export const listOfPenalties = (
  penalties: Penalty[],
  suffixRender: (penalty: Penalty) => ReactNode
): Model[] => {
  function getPenaltyTypeCategory(penaltyType: PenaltyType): string {
    switch (penaltyType) {
      case PenaltyType.PERMANENT_EXPULSION:
        return Category.PERMANENT_EXPULSION;
      default:
        return ''; // 영구 패널티인 밴만 리스트에 보여짐. 나머지가 온다면 뭔가 잘못된 것
    }
  }

  return penalties.map((penalty) => ({
    category: getPenaltyTypeCategory(penalty.penaltyType),
    crewId: penalty.crewId,
    avatarIconUri: penalty.avatarIconUri,
    nickname: penalty.nickname,
    suffix: suffixRender(penalty),
  }));
};

// blockedCrews는 "모든 파티룸의 차단 목록"임. 현재 파티룸 화면에 다 보여줌
export const listOfMyBlockedCrews = (
  blockedCrews: BlockedCrew[],
  suffixRender: (blockedCrew: BlockedCrew) => ReactNode
): Model[] => {
  return blockedCrews.map((crew) => ({
    category: Category.BLOCK,
    crewId: crew.blockedCrewId,
    avatarIconUri: crew.avatarIconUri,
    nickname: crew.nickname,
    suffix: suffixRender(crew),
  }));
};

export const categorize = (models: Model[]): Categorized<Model> => {
  return _categorize({
    items: models,
    categoryKey: 'category',
    orderReferenceArr: [Category.PERMANENT_EXPULSION, Category.BLOCK],
  });
};
