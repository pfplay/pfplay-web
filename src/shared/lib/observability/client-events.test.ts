import { recordClientEvent } from './client-events';

describe('recordClientEvent (환경 게이트)', () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.debugLevel = 0;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  test('preview(스테이징)에선 info 이벤트를 console.info 로 emit 한다', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');

    recordClientEvent({ type: 'PARTYROOM_SUBSCRIBE', partyroomId: 7 });

    expect(infoSpy).toHaveBeenCalledWith(
      '[client-obs]',
      expect.objectContaining({ type: 'PARTYROOM_SUBSCRIBE', partyroomId: 7 })
    );
  });

  test('production 에선 info 이벤트를 emit 하지 않는다 (기본 침묵)', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');

    recordClientEvent({ type: 'PARTYROOM_SUBSCRIBE', partyroomId: 7 });

    expect(infoSpy).not.toHaveBeenCalled();
  });

  test('production 에선 error 이벤트(EVENT_RECEIVED_FOREIGN)도 침묵한다', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');

    recordClientEvent({
      type: 'EVENT_RECEIVED_FOREIGN',
      eventType: 'X',
      receivedPartyroomId: 1,
      currentPartyroomId: 2,
      messageId: 'm',
    });

    expect(errorSpy).not.toHaveBeenCalled();
  });

  test('production + window.debugLevel 상향 시 escape hatch 로 emit 한다', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');
    window.debugLevel = 1;

    recordClientEvent({ type: 'WS_STOMP_ERROR', message: 'boom' });

    expect(errorSpy).toHaveBeenCalledWith(
      '[client-obs]',
      expect.objectContaining({ type: 'WS_STOMP_ERROR' })
    );
  });

  test('error 이벤트는 console.error, 그 외는 console.info 로 라우팅한다 (severity 보존)', () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');

    recordClientEvent({ type: 'WS_STOMP_ERROR', message: 'boom' });

    expect(errorSpy).toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
  });
});
