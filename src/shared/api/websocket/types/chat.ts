import { PartyroomGrade } from '../../http/types/@enums';

export type FromUser = {
  nickname: string; // 채팅을 송신하는 자의 닉네임
  partyroomId: string; // 파티룸 식별자(그룹 식별자)
  partyroomGrade: PartyroomGrade; // 멤버 그레이드
  id?: number;
  userId: {
    uid: string;
  };
  src?: string; // check if BE is send this
};

// 채팅 송신 요청 '/pub/partyroom/api/v1/send/chat'
export type SendChatRequest = {
  message: string;
  fromUser: Pick<FromUser, 'nickname' | 'partyroomId' | 'partyroomGrade'>;
};

// 채팅 수신 응답 '/sub/partyroom/{partyroom_id}'
export type ReceiveChatResponse = {
  message: string;
  fromUser: FromUser;
};
