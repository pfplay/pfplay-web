import { GradeType, PartyroomGrade } from './@enums';

export interface GetPartyroomMemberRequest {
  partyroomId: string;
}

export interface PartyroomMember {
  uid: string;
  partyroomGrade: PartyroomGrade;
  nickname: string;
  memberId: number;
  gradeType: GradeType;
  avatarIconUri: string;
}

export interface GetPartyroomMemberResponse {
  partyroomId: string;
  members: PartyroomMember[];
}
