import { Me } from '@/entities/me';
import { ActivityType, ObtainmentType } from '@/shared/api/http/types/@enums';
import { AvatarBody } from '@/shared/api/http/types/users';
import { Dictionary } from '@/shared/lib/localization/i18n.context';
import { processI18nString } from '@/shared/lib/localization/renderer/processors/variable-processor-util';

export type Model = AvatarBody;

export const locked = (
  model: Model,
  me: Me.Model | undefined, // `undefined` is not fetched yet
  t: Dictionary
): { is: boolean; reason?: string } => {
  if (!me) return { is: true };
  if (model.obtainableType === ObtainmentType.BASIC) return { is: false };

  const activityType = ObtainmentTypeToActivityTypeMap[model.obtainableType];
  const myScore = Me.score(me, activityType);
  const isLocked = model.obtainableScore > myScore;

  return {
    is: isLocked,
    reason: isLocked
      ? lockedMessage(model.obtainableType, model.obtainableScore - myScore, t)
      : undefined,
  };
};

const ObtainmentTypeToActivityTypeMap: Record<
  Exclude<ObtainmentType, ObtainmentType.BASIC>,
  ActivityType
> = {
  [ObtainmentType.DJ_PNT]: ActivityType.DJ_PNT,
  [ObtainmentType.REF_LINK]: ActivityType.REF_LINK,
  [ObtainmentType.ROOM_ACT]: ActivityType.ROOM_ACT,
};

const ObtainmentTypeLabelMap: Record<Exclude<ObtainmentType, ObtainmentType.BASIC>, string> = {
  [ObtainmentType.DJ_PNT]: 'DJ',
  [ObtainmentType.REF_LINK]: 'Refferal Link',
  [ObtainmentType.ROOM_ACT]: 'Room Activation',
};

const lockedMessage = (
  type: Exclude<ObtainmentType, ObtainmentType.BASIC>,
  lessScore: number,
  t: Dictionary
) => {
  const label = ObtainmentTypeLabelMap[type];
  return processI18nString(t.common.para['points_to_unlock\t'], {
    points: `${lessScore} ${label}`,
  });
};
