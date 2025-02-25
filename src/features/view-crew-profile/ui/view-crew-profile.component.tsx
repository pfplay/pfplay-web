import { Profile } from '@/entities/profile';
import { ActivityType } from '@/shared/api/http/types/@enums';
import { CrewProfile } from '@/shared/api/http/types/crews';
import { ProfileCard } from '@/shared/ui/components/profile-card';
import useViewCrewProfile from '../api/use-view-crew-profile';

interface Props {
  crewId: number;
}

export default function ViewCrewProfile({ crewId }: Props) {
  const { data: crew } = useViewCrewProfile(crewId);

  if (!crew) {
    return null;
  }

  return (
    <ProfileCard
      profile={{
        avatarBodyUri: crew.avatarBodyUri,
        avatarFaceUri: crew.avatarFaceUri,
        combinePositionX: crew.combinePositionX,
        combinePositionY: crew.combinePositionY,
        nickname: crew.nickname,
        introduction: crew.introduction ?? '',
        score: Profile.score(crew.activitySummaries, ActivityType.DJ_PNT),
        registrationDate: Profile.registrationDate(crew.registrationDate ?? ''), // TODO: api 수정 후 ''제거
      }}
    />
  );
}

// TODO: Me.Model.score와 여기서 score, registrationDate 추출 후 shared에 넣는 것 고민
export const score = (model: CrewProfile, activityType: ActivityType): number => {
  const summary = model.activitySummaries.find((summary) => summary.activityType === activityType);

  return summary ? summary.score : 0;
};

export const registrationDate = (model: CrewProfile): string => {
  return model.registrationDate?.replace(/-/g, '.') || '';
};
