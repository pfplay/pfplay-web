import { MemberGrade, PartyroomGrade } from './@enums';

export interface GetPartyroomMemberRequest {
  partyroomId: string;
}

export interface PartyroomMember {
  uid: string;
  partyroomGrade: PartyroomGrade;
  nickname: string;
  memberId: number;
  gradeType: MemberGrade;
  avatarIconUri: string;
}

export interface GetPartyroomMemberResponse {
  partyroomId: string;
  members: PartyroomMember[];
}
