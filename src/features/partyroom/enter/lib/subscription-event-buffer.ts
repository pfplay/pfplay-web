import { IMessage } from '@stomp/stompjs';

/**
 * #491 스냅샷-구독 유실 구간 차단.
 *
 * 룸 입장은 "스냅샷(GET /setup) + 이후 이벤트 구독"으로 상태를 만든다. 이 둘의 경계에는
 * 두 방향의 유실 구간이 있다.
 *
 *  1. 구독을 스냅샷 *뒤에* 걸면 — 스냅샷 생성 시점부터 브로커에 구독이 등록되기까지 발생한
 *     이벤트가 아무에게도 전달되지 않는다. `CREW_ENTERED` 처럼 전체 상태가 아닌 델타를
 *     1회만 싣는 이벤트는 이때 영구 유실된다(재조회·reconcile 경로가 없음).
 *  2. 구독을 스냅샷 *앞에* 걸어도 — 스냅샷이 만들어진 뒤 그것이 적용(initPartyroom)되기
 *     전에 도착한 이벤트는, 뒤이어 적용되는 (더 낡은) 스냅샷에 덮여 사라진다.
 *
 * 그래서 "구독 먼저, 스냅샷 적용까지 보류, 적용 후 재생" 순서가 필요하다. 이 버퍼가 (2)를
 * 담당하고, 호출부의 구독-먼저 배치가 (1)을 담당한다.
 *
 * 재생은 at-least-once 다 — 보류 중 모은 이벤트에는 스냅샷에 이미 반영된 것도 섞여 있다.
 * 룸 이벤트 핸들러들이 멱등이라 안전하다: `CREW_ENTERED` 는 upsert,
 * `DJ_QUEUE_CHANGED` 는 큐 전체를 싣고, `PLAYBACK_STARTED` 는 `eventId` 로 중복 방출을 막는다.
 */
export type SubscriptionEventBuffer = {
  /** 구독에 등록할 핸들러. 보류 중이면 모아두고, 아니면 즉시 전달한다. */
  handle: (message: IMessage) => void;
  /** 재수화(스냅샷 재적용) 시작 — 이후 도착분을 다시 모은다. */
  hold: () => void;
  /** 스냅샷 적용 완료 — 모아둔 순서 그대로 재생하고 버퍼를 비운다. */
  release: () => void;
};

/**
 * @param dispatch 최신 이벤트 핸들러를 돌려주는 게터. 구독 핸들러는 한 번만 등록되는 반면
 *   핸들러는 렌더마다 새로 만들어지므로, 값이 아니라 게터로 받아 stale closure 를 피한다.
 */
export function createSubscriptionEventBuffer(
  dispatch: () => (message: IMessage) => void
): SubscriptionEventBuffer {
  let held = true;
  let pending: IMessage[] = [];

  return {
    handle(message) {
      if (held) {
        pending.push(message);
        return;
      }

      dispatch()(message);
    },
    hold() {
      held = true;
    },
    release() {
      held = false;
      const replaying = pending;
      pending = [];
      replaying.forEach((message) => dispatch()(message));
    },
  };
}
