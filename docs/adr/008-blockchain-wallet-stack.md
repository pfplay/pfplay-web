# ADR-008: 블록체인 지갑 연동에 wagmi + viem + RainbowKit 채택

- **상태**: 채택됨
- **일자**: 2024-06

## 맥락

PFPlay는 NFT 기반 아바타를 지원하며, 사용자가 지갑을 연결하여 보유 NFT를 조회하고 아바타로 사용할 수 있어야 한다. 지갑 연결 UI, 체인 전환, 트랜잭션 서명 등의 Web3 기능이 필요하다.

## 선택지

| 선택지                        | 장점                                 | 단점                             |
| ----------------------------- | ------------------------------------ | -------------------------------- |
| ethers.js 직접 사용           | 유연                                 | 지갑 UI/상태 관리 직접 구현 필요 |
| web3-react                    | Uniswap 검증                         | 유지보수 불활발                  |
| **wagmi + viem + RainbowKit** | React 네이티브, 타입 안전, UX 완성도 | 3개 라이브러리 조합              |

## 결정

**wagmi + viem + RainbowKit** 조합을 채택한다.

- **wagmi**: React hooks for Ethereum — `useAccount`, `useConnect` 등
- **viem**: 경량 EVM 클라이언트 — ethers.js 대체
- **RainbowKit**: 지갑 연결 모달 UI — 컴팩트 모드 + 다크 테마

NFT 데이터 조회에는 **Alchemy SDK**를 추가 사용한다.

### 지원 체인

```ts
chains: [polygon, optimism, arbitrum];
// mainnet은 viem issue #881로 인해 주석 처리
```

### 하이드레이션 불일치 방지

```tsx
// wallet.provider.tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

서버에서는 지갑 상태를 알 수 없으므로, 클라이언트 마운트 후에만 Provider를 렌더링한다.

### 서버 동기화

`useGlobalWalletSync` 훅이 지갑 연결/해제 시 백엔드에 주소를 동기화한다.

### 핵심 파일

- `src/app/_providers/wallet.provider.tsx` — Provider 설정
- `src/entities/wallet/` — 지갑 관련 엔티티 (훅, 모델, API)
- `src/entities/wallet/lib/use-global-wallet-sync.hook.ts` — 서버 동기화

## 결과

- **(+)** React 훅 기반으로 선언적 지갑 상태 관리
- **(+)** RainbowKit 모달 UI로 지갑 연결 UX 완성도 높음
- **(+)** viem의 타입 안전성 — 체인 ID, ABI 인코딩 등 컴파일 타임 검증
- **(-)** wagmi + viem + RainbowKit 3개 라이브러리 의존
- **(-)** Alchemy SDK는 MSW로 테스트 불가 — 별도 인프라 필요
- **(-)** viem 호환 이슈로 mainnet 비활성화 상태
