import { Profile } from '@/entities/profile';
import { ActivityType } from '@/shared/api/http/types/@enums';
import { CrewProfile } from '@/shared/api/http/types/crews';
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
    <Profile
      crew={{
        avatarBodyUri: crew.avatarBodyUri,
        avatarFaceUri: crew.avatarFaceUri,
        combinePositionX: crew.combinePositionX,
        combinePositionY: crew.combinePositionY,
        nickname: crew.nickname,
        introduction: crew.introduction || '',
        score: score(crew, ActivityType.DJ_PNT),
        registrationDate: registrationDate(crew),
      }}
    />
  );
}

export const score = (model: CrewProfile, activityType: ActivityType): number => {
  const summary = model.activitySummaries.find((summary) => summary.activityType === activityType);

  return summary ? summary.score : 0;
};

export const registrationDate = (model: CrewProfile): string => {
  return model.registrationDate?.replace(/-/g, '.') || '';
};
