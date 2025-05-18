# Wallet

`wallet` 엔티티는 애플리케이션 내에서 사용자의 암호화폐 지갑 연결 및 관련 기능을 관리합니다. [wagmi](https://wagmi.sh/) 라이브러리를 사용하여 지갑 연결 로직을 처리하고, [@rainbow-me/rainbowkit](https://www.rainbowkit.com/)을 통해 사용자 친화적인 지갑 연결 UI를 제공합니다. 또한, [Alchemy SDK](https://docs.alchemy.com/reference/alchemy-sdk-quickstart)를 활용하여 사용자가 소유한 NFT 정보를 가져옵니다.

## 주요 기능 및 사용 예시

### 1. 지갑 연결 및 UI (`ConnectWallet`, `useInformWalletLinkage`)

사용자가 애플리케이션과 상호작용하기 위해 암호화폐 지갑을 연결할 수 있도록 지원합니다.

- `ConnectWallet`: 다양한 상태(미연결, 연결됨, 잘못된 네트워크)에 따라 커스터마이징 가능한 지갑 연결 버튼 UI를 제공합니다.
- `useInformWalletLinkage`: 사용자에게 지갑 연결 필요성을 알리고, 연결 과정을 안내하는 다이얼로그를 호출하는 훅입니다.

**사용 예시: 프로필 아바타 설정 시 지갑 연결 버튼 표시**

사용자가 프로필 아바타를 NFT로 설정하려고 할 때, 지갑이 연결되어 있지 않다면 `ConnectWalletButton` 컴포넌트를 통해 지갑 연결을 유도할 수 있습니다.

```tsx
// src/features/edit-profile-avatar/ui/connect-wallet-button.component.tsx
import { ConnectWallet } from '@/entities/wallet';
import { Button } from '@/shared/ui/components/button';

export default function ConnectWalletButton() {
  return (
    <ConnectWallet
      notConnectedRender={({ recommendedText, onClick, icon }) => (
        <Button variant='fill' color='secondary' Icon={icon} onClick={onClick}>
          {recommendedText}
        </Button>
      )}
      // ... (connectedRender, wrongNetworkRender 등)
    />
  );
}
```

**사용 예시: 특정 기능 사용 전 지갑 연결 유도**

파티룸을 생성하려는 사용자가 아직 지갑을 연결하지 않았다면, `useInformWalletLinkage` 훅을 사용하여 지갑 연결 안내 다이얼로그를 표시할 수 있습니다.

```tsx
// src/features/partyroom/create/ui/card.component.tsx
import { useInformWalletLinkage, useIsWalletLinked } from '@/entities/wallet';

export default function PartyroomCreateCard() {
  const isWalletLinked = useIsWalletLinked();
  const informWalletLinkage = useInformWalletLinkage();

  const handleClickBeAHostBtn = async () => {
    if (!(await isWalletLinked())) {
      informWalletLinkage(); // 지갑 미연결 시 안내 다이얼로그 호출
      return;
    }
    // ... (파티룸 생성 로직)
  };

  return <button onClick={handleClickBeAHostBtn}>호스트 되기</button>;
}
```

### 2. NFT 정보 조회 (`Nft`, `useNfts`)

연결된 지갑 주소를 기반으로 사용자가 소유한 NFT 목록을 조회하고, 애플리케이션 내에서 활용할 수 있도록 합니다.

- `Nft (./model/nft.model)`: Alchemy SDK에서 받아온 NFT 원시 데이터를 정제하고, 이미지 유효성 검사 등을 수행하여 애플리케이션에서 사용하기 적합한 `Model` 형태로 변환합니다.
- `useNfts`: 현재 연결된 지갑의 NFT 목록을 가져오는 React Query 훅입니다. `useFetchNfts` 쿼리를 내부적으로 사용하며, 지갑 연결 상태에 따라 자동으로 데이터를 관리합니다.

**사용 예시: 프로필 아바타로 사용할 NFT 목록 표시**

사용자가 자신의 프로필 아바타를 소유한 NFT 중에서 선택할 수 있도록 `useNfts` 훅을 사용하여 NFT 목록을 가져와 화면에 표시합니다.

```tsx
// src/features/edit-profile-avatar/ui/avatar-face-list.component.tsx
import { useNfts } from '@/entities/wallet';
import AvatarFaceListItem from './avatar-face-list-item.component';

const AvatarFaceList = () => {
  const nfts = useNfts(); // 연결된 지갑의 NFT 목록 가져오기

  return (
    <div>
      {nfts.map((nft) => (
        <AvatarFaceListItem key={nft.resourceUri} meta={nft} />
      ))}
    </div>
  );
};
```

### 3. 지갑 상태 관리 및 동기화 (`useIsWalletLinked`, `useGlobalWalletSync`)

사용자의 지갑 연결 상태를 확인하고, 애플리케이션의 상태와 서버 데이터를 일관되게 유지합니다.

- `useIsWalletLinked`: 현재 사용자가 특정 조건을 만족하면서(예: 특정 권한 등급) 지갑을 애플리케이션에 연결했는지 여부를 비동기적으로 확인합니다.
- `useGlobalWalletSync`: 앱 전역에서 사용자의 지갑 연결 상태(wagmi를 통해 감지)가 변경될 때마다, 해당 변경사항을 서버에 자동으로 업데이트하여 데이터 정합성을 유지합니다. (`useUpdateMyWallet` 뮤테이션 사용)

**사용 예시: 전역 지갑 상태 동기화**

애플리케이션의 최상위 Provider (`WalletProvider`)에서 `useGlobalWalletSync`를 호출하여, 사용자가 외부(예: 브라우저 확장 프로그램)에서 지갑 연결을 변경하더라도 애플리케이션 및 서버의 상태가 일관되게 유지되도록 합니다.

```tsx
// src/app/_providers/wallet.provider.tsx
import { useGlobalWalletSync } from '@/entities/wallet';

function SyncWallet({ children }) {
  useGlobalWalletSync(); // 현재 사용자의 지갑 주소와 서버의 지갑 주소 동기화
  return children;
}

export const WalletProvider = ({ children }) => {
  // ... (WagmiProvider, RainbowKitProvider 설정)
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider /* ... */>
        {mounted && <SyncWallet>{children}</SyncWallet>}
      </RainbowKitProvider>
    </WagmiProvider>
  );
};
```

## API 호출

`src/entities/wallet/api` 디렉토리에는 다음과 같은 API 호출 관련 훅들이 정의되어 있습니다.

- `useFetchNfts.query`: Alchemy SDK를 사용하여 현재 연결된 지갑 주소의 NFT 목록을 조회합니다.
- `useUpdateMyWallet.mutation` (원래 파일명: `use-update-my-wallet.mutation.ts`): 사용자의 지갑 주소 정보를 서버에 업데이트합니다.
