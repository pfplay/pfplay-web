import { ReactNode } from 'react';
import { PenaltyType } from '@/shared/api/http/types/@enums';
import { BlockedCrew } from '@/shared/api/http/types/crews';
import { PartyroomCrew, Penalty } from '@/shared/api/http/types/partyrooms';
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

export const listOfPenalty = (penalties: Penalty[], allCrews: PartyroomCrew[]): Model[] => {
  const allCrewsMap = new Map<PartyroomCrew['crewId'], PartyroomCrew>(
    allCrews.map((crew) => [crew.crewId, crew])
  );

  function getPenaltyTypeCategory(penaltyType: PenaltyType): string {
    switch (penaltyType) {
      case PenaltyType.ONE_TIME_EXPULSION:
        return Category.ONE_TIME_EXPULSION;
      default:
        return ''; // 영구 패널티인 밴만 리스트에 보여짐. 나머지가 온다면 뭔가 잘못된 것
    }
  }

  return penalties
    .map((penalty) => {
      const crew = allCrewsMap.get(penalty.crewId);
      if (!crew) return null;

      return {
        category: getPenaltyTypeCategory(penalty.penaltyType),
        crewId: crew.crewId,
        avatarIconUri: crew.avatarIconUri,
        nickname: crew.nickname,
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
      };
    })
    .filter((model) => model !== null);
};

export const listOfMyBlockedCrews = (
  blockedCrews: BlockedCrew[],
  allCrews: PartyroomCrew[]
): Model[] => {
  const allCrewsMap = new Map<PartyroomCrew['crewId'], PartyroomCrew>(
    allCrews.map((crew) => [crew.crewId, crew])
  );

  return blockedCrews
    .map((blockedCrew) => {
      const crew = allCrewsMap.get(blockedCrew.blockedCrewId);
      if (!crew) return null;

      return {
        category: Category.BLOCK,
        crewId: crew.crewId,
        avatarIconUri: crew.avatarIconUri,
        nickname: crew.nickname,
        suffix: (
          <Button
            size='xs'
            color='secondary'
            variant='outline'
            onClick={() => alert(`Not Impl ${blockedCrew.blockId}`)}
          >
            Lift{/* TODO: i18n */}
          </Button>
        ),
      };
    })
    .filter((model) => model !== null);
};

export const categorize = (models: Model[]): Categorized<Model> => {
  return _categorize({
    items: models,
    categoryKey: 'category',
    orderReferenceArr: [Category.ONE_TIME_EXPULSION, Category.BLOCK],
  });
};
