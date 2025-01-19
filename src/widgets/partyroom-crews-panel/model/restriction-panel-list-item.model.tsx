import { ReactNode } from 'react';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { BlockedCrew } from '@/shared/api/http/types/crews';
import { Penalty } from '@/shared/api/http/types/partyrooms';
import { Categorized, categorize as _categorize } from '@/shared/lib/functions/categorize';
import { Button } from '@/shared/ui/components/button';

export type Model = {
  category: string;
  crewId: number;
  avatarIconUri: string;
  nickname: string;
  suffix: ReactNode;
};

const enum Category {
  ONE_TIME_EXPULSION = 'ONE_TIME_EXPULSION',
  BLOCK = 'BLOCK',
}

export const listOfPenalties = (penalties: Penalty[]): Model[] => {
  function getPenaltyTypeCategory(penaltyType: PenaltyType): string {
    switch (penaltyType) {
      case PenaltyType.ONE_TIME_EXPULSION:
        return Category.ONE_TIME_EXPULSION;
      default:
        return ''; // 영구 패널티인 밴만 리스트에 보여짐. 나머지가 온다면 뭔가 잘못된 것
    }
  }

  return penalties.map((penalty) => ({
    category: getPenaltyTypeCategory(penalty.penaltyType),
    crewId: penalty.crewId,
    avatarIconUri: penalty.avatarIconUri || '/images/Temp/face.png',
    nickname: penalty.nickname || 'Unknown (이름 가져오기 미구현)',
    suffix: (
      <Button
        size='xs'
        color='secondary'
        variant='outline'
        onClick={() => alert(`Not Impl ${penalty.penaltyId}`)}
      >
        Lift{/* TODO: i18n */}
      </Button>
    ),
  }));
};

// blockedCrews는 "모든 파티룸의 차단 목록"임. 현재 파티룸 화면에 다 보여줌
export const listOfMyBlockedCrews = (blockedCrews: BlockedCrew[]): Model[] => {
  return blockedCrews.map((crew) => ({
    category: Category.BLOCK,
    crewId: crew.blockedCrewId,
    avatarIconUri: crew.avatarIconUri,
    nickname: crew.nickname,
    suffix: (
      <Button
        size='xs'
        color='secondary'
        variant='outline'
        onClick={() => alert(`Not Impl ${crew.blockId}`)}
      >
        Lift{/* TODO: i18n */}
      </Button>
    ),
  }));
};

export const categorize = (models: Model[]): Categorized<Model> => {
  return _categorize({
    items: models,
    categoryKey: 'category',
    orderReferenceArr: [Category.ONE_TIME_EXPULSION, Category.BLOCK],
  });
};
