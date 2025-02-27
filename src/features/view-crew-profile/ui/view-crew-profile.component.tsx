import { ActivityType } from '@/shared/api/http/types/@enums';
import ProfileCard from './profile-card.component';
import useViewCrewProfile from '../api/use-view-crew-profile';
import { extractScore, getRegistrationDate } from '../lib/profile.lib';

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
        score: extractScore(crew.activitySummaries, ActivityType.DJ_PNT),
        registrationDate: getRegistrationDate(crew.registrationDate ?? ''), // TODO: api 수정 후 ''제거
      }}
    />
  );
}
