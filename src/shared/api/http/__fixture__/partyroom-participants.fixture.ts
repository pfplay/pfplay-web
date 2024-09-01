import { GradeType, PartyroomGrade } from '../types/@enums';
import { Participant } from '../types/partyrooms';

export const fixturePartyroomCrews: Participant[] = [
  {
    uid: '1',
    partyroomGrade: PartyroomGrade.ADMIN,
    nickname: 'AdminUser',
    crewId: 101,
    gradeType: GradeType.HOST,
    avatarIconUri: '/images/Temp/nft.png',
  },
  {
    uid: '2',
    partyroomGrade: PartyroomGrade.CM,
    nickname: 'CommunityManager',
    crewId: 102,
    gradeType: GradeType.COMMUNITY_MANAGER,
    avatarIconUri: '/images/Temp/nft.png',
  },
  {
    uid: '3',
    partyroomGrade: PartyroomGrade.MOD,
    nickname: 'ModeratorUser',
    crewId: 103,
    gradeType: GradeType.MODERATOR,
    avatarIconUri: '/images/Temp/nft.png',
  },
  {
    uid: '4',
    partyroomGrade: PartyroomGrade.CLUBBER,
    nickname: 'ClubberUser',
    crewId: 104,
    gradeType: GradeType.CLUBBER,
    avatarIconUri: '/images/Temp/nft.png',
  },
  {
    uid: '5',
    partyroomGrade: PartyroomGrade.LISTENER,
    nickname: 'ListenerUser',
    crewId: 105,
    gradeType: GradeType.LISTENER,
    avatarIconUri: '/images/Temp/nft.png',
  },
] satisfies Participant[];
