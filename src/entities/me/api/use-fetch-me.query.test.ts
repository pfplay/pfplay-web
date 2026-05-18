import { usersService } from '@/shared/api/http/services';
import { queryOptions } from './use-fetch-me.query';

vi.mock('@/shared/api/http/services', () => ({
  usersService: {
    getMyInfo: vi.fn(),
    getMyProfileSummary: vi.fn(),
  },
}));

const getMyInfo = usersService.getMyInfo as ReturnType<typeof vi.fn>;
const getMyProfileSummary = usersService.getMyProfileSummary as ReturnType<typeof vi.fn>;

function runQueryFn() {
  // queryFn 은 인자 없이 호출 가능하도록 정의됨.
  return (queryOptions.queryFn as () => Promise<unknown>)();
}

describe('useFetchMe queryFn — spread merge trap 영구 차단 (옵션 5a, #7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getMyInfo / getMyProfileSummary 를 동시 발사한다 (순차 await 아님)', async () => {
    let resolveInfo!: (v: unknown) => void;
    getMyInfo.mockReturnValue(
      new Promise((res) => {
        resolveInfo = res;
      })
    );
    getMyProfileSummary.mockResolvedValue({ nickname: 'n' });

    const promise = runQueryFn();
    // Promise.all 이면 info 가 아직 pending 이라도 summary 가 이미 호출됨.
    // 순차 await 였다면 info resolve 전까지 summary 미호출.
    await Promise.resolve();
    expect(getMyInfo).toHaveBeenCalledTimes(1);
    expect(getMyProfileSummary).toHaveBeenCalledTimes(1);

    resolveInfo({ authorityTier: 'FM' });
    await promise;
  });

  test('두 응답을 spread merge 하여 반환한다', async () => {
    getMyInfo.mockResolvedValue({ uid: 'u1', authorityTier: 'FM', profileUpdated: false });
    getMyProfileSummary.mockResolvedValue({ nickname: '새유저', avatarBodyUri: 'b' });

    const result = (await runQueryFn()) as Record<string, unknown>;

    expect(result).toMatchObject({
      uid: 'u1',
      authorityTier: 'FM',
      profileUpdated: false,
      nickname: '새유저',
      avatarBodyUri: 'b',
    });
  });
});
