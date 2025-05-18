# Current Partyroom Entity

`current-partyroom` 엔티티는 사용자가 현재 참여하고 있는 파티룸의 모든 상태와 관련 로직을 중앙에서 관리합니다. Zustand를 사용한 스토어를 통해 파티룸 ID, 사용자 정보, 플레이백 상태, 크루 목록, 채팅, 알림 등 다양한 실시간 정보를 관리하며, 파티룸 내에서의 사용자 경험을 구성하는 핵심적인 역할을 합니다.

## 주요 기능 및 사용 예시

### 1. 파티룸 상태 모델 정의 (`./model/current-partyroom.model.ts` 외)

파티룸과 관련된 다양한 데이터 모델을 정의합니다.

- **`CurrentPartyroom.Model`**: 파티룸의 전체 상태를 아우르는 메인 모델입니다.
- **`Crew.Model`**: 파티룸 참여자(크루)의 정보를 정의하며, 등급(`GradeType`)에 따른 권한 관리 로직(`Permission`, `GradeComparator` 클래스)을 포함합니다.
- **`Playback.Model`**: 현재 재생 중인 음악의 상세 정보 및 재생 시간 계산 로직(`getInitialSeek`)을 포함합니다.
- **`ChatMessage.Model`**: 채팅 메시지의 구조를 정의합니다.
- **`AlertMessage.Model`**: 파티룸 내에서 발생하는 다양한 알림(등급 조정, 페널티 등)의 메시지 타입을 정의합니다.
- **`Dj.Model`**: DJ 관련 정보를 정의합니다.

### 2. 파티룸 상태 스토어 생성 및 관리 (`./model/current-partyroom.store.ts`)

`createCurrentPartyroomStore` 함수는 `CurrentPartyroom.Model`에 정의된 상태와 액션들을 실제로 구현하는 Zustand 스토어를 생성합니다.

- **상태**: `id`, `me`, `playback`, `crews`, `chat`, `alert` 등 모델에 정의된 모든 상태를 가집니다.
- **액션**: 각 상태를 업데이트하는 함수들 (`updateMe`, `updatePlayback` 등)과 파티룸 입장/퇴장 시 사용되는 `init`, `reset` 함수, 채팅 메시지 추가/수정 함수 (`appendChatMessage`, `updateChatMessage`), 백엔드 퇴장 플래그 설정 함수 (`markExitedOnBackend`) 등을 제공합니다.

**사용 예시: 파티룸 입장 및 퇴장 시 스토어 관리**

파티룸에 입장하면 `init` 액션을 호출하여 서버로부터 받은 초기 데이터로 스토어를 설정하고, 퇴장 시에는 `reset` 액션을 호출하여 스토어를 초기 상태로 되돌립니다.

```tsx
// (예시) 파티룸 입장/퇴장 로직이 있는 컴포넌트 또는 훅
import { useStores } from '@/shared/lib/store/stores.context';
import { partyroomService } from '@/shared/api/http/services'; // 예시 서비스

function usePartyroomLifecycle(partyroomId: number) {
  const { useCurrentPartyroom } = useStores();
  const initPartyroom = useCurrentPartyroom((state) => state.init);
  const resetPartyroom = useCurrentPartyroom((state) => state.reset);

  const enterPartyroom = async () => {
    // const initialData = await partyroomService.getPartyroomDetails(partyroomId); // API 호출로 초기 데이터 가져오기
    // initPartyroom(initialData);
  };

  const leavePartyroom = () => {
    // ... 퇴장 API 호출 등
    resetPartyroom();
  };
}
```

### 3. 커스텀 훅을 통한 상태 접근 및 로직 처리

`current-partyroom` 엔티티는 다양한 커스텀 훅을 제공하여 특정 상태나 로직에 쉽게 접근하고 사용할 수 있도록 합니다.

- **`useCurrentPartyroomChat` (`./lib/use-chat.hook.ts`)**: 파티룸 내 실시간 채팅 메시지 목록을 제공합니다. 내부적으로 `currentPartyroom` 스토어의 `chat` 객체를 구독합니다.

  ```tsx
  // (예시) 채팅 메시지를 표시하는 컴포넌트
  import { useCurrentPartyroomChat } from '@/entities/current-partyroom';

  function ChatDisplay() {
    const messages = useCurrentPartyroomChat();
    return (
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            {msg.user.name}: {msg.text}
          </li>
        ))}
      </ul>
    );
  }
  ```

- **`useCurrentPartyroomAlerts` (`./lib/alerts/use-alerts.hook.tsx`)**: 파티룸 내에서 발생하는 주요 알림(등급 변경, 페널티)을 처리합니다. 이러한 알림은 주로 서버에서 발생한 이벤트(예: 웹소켓을 통해 전달되는 등급 변경, 페널티 부여 이벤트)를 `partyroom-client`와 같은 다른 엔티티/모듈에서 수신한 후, `currentPartyroom` 스토어의 `alert.notify()` 메소드를 호출함으로써 트리거됩니다. 내부적으로 `useGradeAdjustedAlert`와 `usePenaltyAlert`를 호출합니다.

  - `useOpenGradeAdjustmentAlertDialog` (`./lib/alerts/use-grade-adjusted-alert.hook.tsx`): 등급 변경 시 사용자에게 알림 다이얼로그를 표시합니다.
  - `usePenaltyAlert` (`./lib/alerts/use-penalty-alert.hook.tsx`): 페널티(채팅 금지, 강퇴 등) 발생 시 알림 다이얼로그를 표시하고, 경우에 따라 추가 작업(예: 파티룸에서 내보내기)을 수행합니다.

  ```tsx
  // (예시) 파티룸 레이아웃 컴포넌트 등에서 알림 훅 사용
  import { useCurrentPartyroomAlerts } from '@/entities/current-partyroom';

  function PartyroomLayout({ children }) {
    useCurrentPartyroomAlerts(); // 파티룸 알림 시스템 활성화
    return <>{children}</>;
  }
  ```

- **`useRemoveCurrentPartyroomCaches` (`./lib/use-remove-current-partyroom-caches.hook.ts`)**: 현재 파티룸과 관련된 React Query 캐시(DJ 대기열, 크루 목록 등)를 정리하는 함수를 제공합니다. 파티룸 퇴장 시 호출되어 불필요한 캐시를 제거합니다.

  ```tsx
  // (예시) 파티룸 퇴장 로직 내에서 캐시 정리
  import { useRemoveCurrentPartyroomCaches } from '@/entities/current-partyroom';

  function useHandleLeavePartyroom() {
    const removeCaches = useRemoveCurrentPartyroomCaches();
    // ... (다른 퇴장 로직)

    const leaveAndCleanup = () => {
      // ... (퇴장 API 호출, 스토어 리셋 등)
      removeCaches();
    };

    return leaveAndCleanup;
  }
  ```
