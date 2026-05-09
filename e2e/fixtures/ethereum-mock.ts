/**
 * Playwright addInitScript()로 page load 전에 주입.
 * 직렬화 가능한 함수여야 함 (import/클로저 없음).
 *
 * RainbowKit/wagmi hydration 시 window.ethereum 존재 여부를 체크하므로
 * 이 mock이 없으면 지갑 provider 초기화 에러 발생.
 */
export const ETHEREUM_MOCK_SCRIPT = () => {
  if (typeof window !== 'undefined' && !(window as any).ethereum) {
    const mockAddress = '0x1234567890123456789012345678901234567890';
    (window as any).ethereum = {
      isMetaMask: true,
      selectedAddress: mockAddress,
      chainId: '0x89', // Polygon (wagmi 설정과 일치)
      request: async ({ method }: { method: string }) => {
        if (method === 'eth_requestAccounts') return [mockAddress];
        if (method === 'eth_accounts') return [mockAddress];
        if (method === 'eth_chainId') return '0x89';
        if (method === 'net_version') return '137';
        return null;
      },
      on: () => {},
      removeListener: () => {},
      isConnected: () => true,
    };
  }
};
