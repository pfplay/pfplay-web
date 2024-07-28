import { GradeType, PartyroomGrade } from './@enums';

export interface GetPartyroomMemberRequest {
  partyroomId: string;
}

export interface Participant {
  uid: string;
  partyroomGrade: PartyroomGrade;
  nickname: string;
  memberId: number;
  gradeType: GradeType;
  avatarIconUri: string;
}

export interface GetParticipantsResponse {
  partyroomId: string;
  members: Participant[];
}
