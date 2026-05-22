/**
 * 클라이언트 측 관측 이벤트 스키마 (Observability Phase A5).
 *
 * Phase A 에선 `console.info`/`console.error` 로만 emit 된다 (OSS only 정책 —
 * 사용자 콘솔 dump 를 받아야 우리에게 도달). Phase B 에서 backend forward
 * endpoint 가 도입되면 {@link recordClientEvent} 구현부만 교체하면 되고,
 * 호출 지점은 변경 zero 다 (스키마를 미리 고정하는 것이 이 파일의 목적).
 */
export type ClientObservabilityEvent =
  | { type: 'WS_CONNECT'; brokerURL: string }
  | { type: 'WS_DISCONNECT'; reason: string; subscriptionCount: number }
  | { type: 'WS_STOMP_ERROR'; message: string }
  | { type: 'PARTYROOM_SUBSCRIBE'; partyroomId: number }
  | { type: 'PARTYROOM_UNSUBSCRIBE'; partyroomId: number }
  | { type: 'PARTYROOM_SUBSCRIBE_REPLACED'; fromPartyroomId: number; toPartyroomId: number }
  | { type: 'EVENT_RECEIVED'; eventType: string; partyroomId: number; messageId: string }
  | {
      // #3 (subscription resurrection / cross-room hijack) 의 결정적 신호 —
      // 화면의 현재 partyroom 과 다른 partyroom 이벤트를 받았다는 직접 증거.
      type: 'EVENT_RECEIVED_FOREIGN';
      eventType: string;
      receivedPartyroomId: number;
      currentPartyroomId: number;
      messageId: string;
    };

/**
 * 관측 이벤트를 기록한다. Phase A: 콘솔 emit only.
 * 오류/불변식 위반 신호(STOMP 에러, foreign 이벤트)는 `console.error` 로,
 * 그 외는 `console.info` 로 — ADR-009(error-monitoring) 의 severity 정책.
 */
export function recordClientEvent(event: ClientObservabilityEvent): void {
  const isError = event.type === 'WS_STOMP_ERROR' || event.type === 'EVENT_RECEIVED_FOREIGN';
  (isError ? console.error : console.info)('[client-obs]', event);
}
