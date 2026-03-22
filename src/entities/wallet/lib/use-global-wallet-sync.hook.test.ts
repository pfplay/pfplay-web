vi.mock('wagmi', () => ({
  useAccount: vi.fn(),
}));
vi.mock('../api/use-update-my-wallet.mutation', () => ({
  __esModule: true,
  default: vi.fn(),
}));

import { renderHook } from '@testing-library/react';
import { useAccount } from 'wagmi';
import useGlobalWalletSync from './use-global-wallet-sync.hook';
import useUpdateMyWallet from '../api/use-update-my-wallet.mutation';

const mockMutate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useUpdateMyWallet as Mock).mockReturnValue({ mutate: mockMutate });
});

describe('useGlobalWalletSync', () => {
  test('지갑이 연결되고 주소가 다르면 updateMyWallet을 호출한다', () => {
    (useAccount as Mock).mockReturnValue({
      address: '0xNewAddress',
      isConnected: true,
    });

    renderHook(() => useGlobalWalletSync('0xOldAddress'));

    expect(mockMutate).toHaveBeenCalledWith({ walletAddress: '0xNewAddress' });
  });

  test('지갑 연결 해제 시 빈 주소로 updateMyWallet을 호출한다', () => {
    (useAccount as Mock).mockReturnValue({
      address: undefined,
      isConnected: false,
    });

    renderHook(() => useGlobalWalletSync('0xOldAddress'));

    expect(mockMutate).toHaveBeenCalledWith({ walletAddress: '' });
  });

  test('지갑 주소가 동일하면 updateMyWallet을 호출하지 않는다', () => {
    (useAccount as Mock).mockReturnValue({
      address: '0xSameAddress',
      isConnected: true,
    });

    renderHook(() => useGlobalWalletSync('0xSameAddress'));

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
