import { IMessage } from '@stomp/stompjs';
import { createSubscriptionEventBuffer } from './subscription-event-buffer';

const message = (body: string) => ({ body }) as IMessage;

describe('createSubscriptionEventBuffer (#491)', () => {
  test('생성 직후는 보류 상태 — release 전엔 전달하지 않는다', () => {
    const dispatch = vi.fn();
    const buffer = createSubscriptionEventBuffer(() => dispatch);

    buffer.handle(message('a'));

    expect(dispatch).not.toHaveBeenCalled();
  });

  test('release 시 보류분을 도착 순서대로 재생한다', () => {
    const dispatch = vi.fn();
    const buffer = createSubscriptionEventBuffer(() => dispatch);

    buffer.handle(message('a'));
    buffer.handle(message('b'));
    buffer.release();

    expect(dispatch.mock.calls.map(([m]) => (m as IMessage).body)).toEqual(['a', 'b']);
  });

  test('release 이후 도착분은 즉시 전달한다', () => {
    const dispatch = vi.fn();
    const buffer = createSubscriptionEventBuffer(() => dispatch);

    buffer.release();
    buffer.handle(message('a'));

    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  test('재생된 이벤트는 버퍼에서 비워져 두 번 재생되지 않는다', () => {
    const dispatch = vi.fn();
    const buffer = createSubscriptionEventBuffer(() => dispatch);

    buffer.handle(message('a'));
    buffer.release();
    buffer.hold();
    buffer.release();

    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  test('hold 로 다시 보류할 수 있다 (재수화 구간)', () => {
    const dispatch = vi.fn();
    const buffer = createSubscriptionEventBuffer(() => dispatch);

    buffer.release();
    buffer.hold();
    buffer.handle(message('a'));
    expect(dispatch).not.toHaveBeenCalled();

    buffer.release();
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  test('dispatch 는 매번 게터로 조회한다 — 핸들러가 교체돼도 최신본으로 전달', () => {
    const first = vi.fn();
    const second = vi.fn();
    let current = first;
    const buffer = createSubscriptionEventBuffer(() => current);

    buffer.handle(message('a')); // 보류 시점의 핸들러는 first
    current = second; // 재렌더로 핸들러 교체
    buffer.release();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
