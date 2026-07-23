/**
 * 유저 개인 큐(/user/sub/session) 세션 이벤트 타입 (멀티 디바이스 승계, #476/platform#369).
 * 룸 브로드캐스트가 아니라 특정 유저의 모든 세션(탭/기기)에 도달하는 user destination 메시지다.
 */
export enum SessionEventType {
  SESSION_SUPERSEDED = 'SESSION_SUPERSEDED',
}

/**
 * 같은 유저가 다른 방으로 입장해 기존 활성 crew 가 밀려났음을 알린다.
 * 수신 세션은 자신의 현재 방이 {@link supersededPartyroomId} 와 일치할 때만 밀려남 처리한다
 * (같은 유저의 새 세션 B 는 {@link newPartyroomId} 에 있으므로 무시).
 */
export type SessionSupersededEvent = {
  type: SessionEventType.SESSION_SUPERSEDED;
  newPartyroomId: number;
  supersededPartyroomId: number;
  occurredAt: number;
};
