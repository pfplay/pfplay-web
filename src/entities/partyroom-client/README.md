# `partyroom-client`

## 1. 개요

`partyroom-client` 엔티티는 사용자가 참여한 파티룸의 WebSocket 클라이언트 연결 및 관련 로직을 중앙에서 관리합니다. `SocketClient` (STOMP 기반)를 사용하여 특정 파티룸의 주제(topic)를 구독하고, 해당 파티룸에서 발생하는 다양한 실시간 이벤트(채팅, 크루 상태 변경, 재생 상태 변경 등)를 수신하여 처리합니다. 또한, 서버로 메시지(예: 채팅 메시지)를 발행하는 기능도 담당합니다.

이 엔티티는 한 번에 하나의 파티룸만 구독할 수 있도록 하는 정책을 가지고 있어, 사용자가 동시에 여러 파티룸에 연결되는 것을 방지합니다.

## 2. 주요 구성 요소 및 역할

### 2.1. `PartyroomClient` (클래스)

- **경로**: `lib/partyroom-client.ts`
- **설명**:
  - 내부적으로 일반 `SocketClient` 인스턴스를 캡슐화하여 파티룸 관련 WebSocket 통신을 처리하는 핵심 클래스입니다.
  - `connect(partyroomId: number, accessToken: string)`: 지정된 `partyroomId`와 `accessToken`을 사용하여 WebSocket 서버에 연결하고, 파티룸 전용 주제 (`/sub/partyrooms/{partyroomId}`)를 구독합니다.
  - `disconnect()`: 현재 연결된 WebSocket 연결을 해제하고 구독을 취소합니다.
  - `sendMessage(message: string)`: 현재 구독 중인 파티룸으로 채팅 메시지를 발행합니다 (`/pub/groups/{subscribedRoomId}/send`).
  - `onMessage(callback: (message: IMessage) => void)`: 구독 중인 주제에서 메시지를 수신했을 때 실행될 콜백 함수를 등록합니다.
  - 한 번에 하나의 파티룸만 구독할 수 있도록 관리합니다. 이미 다른 파티룸에 연결되어 있는 경우, 새로운 연결 시도 전에 기존 연결을 해제합니다.

### 2.2. `PartyroomClientContext` 및 `usePartyroomClient`

- **경로**: `lib/partyroom-client.context.tsx`
- **설명**:
  - `PartyroomClientContext`: `PartyroomClient` 인스턴스를 React 컴포넌트 트리에 제공하기 위한 컨텍스트입니다.
  - `usePartyroomClient`: 컨텍스트를 통해 `PartyroomClient` 인스턴스에 쉽게 접근할 수 있도록 하는 커스텀 훅입니다. `PartyroomClientProvider` (애플리케이션 레벨에서 설정) 내에서 사용해야 합니다.

### 2.3. `useHandleSubscriptionEvent` (훅)

- **경로**: `lib/handle-subscription-event.ts`
- **설명**:
  - `PartyroomClient`의 `onMessage` 콜백으로 등록되어 사용됩니다.
  - STOMP를 통해 수신된 메시지(`IMessage`)를 파싱하고, 메시지 본문의 `eventType` (예: `CHAT`, `CREW_GRADE`, `PLAYBACK_START` 등 `PartyroomEventType`으로 정의됨)에 따라 적절한 처리 로직을 수행하는 함수를 반환합니다.
  - 각 이벤트 타입에 대한 구체적인 처리 로직은 `subscription-callbacks` 디렉토리 내의 개별 콜백 훅들을 호출하여 위임합니다.

### 2.4. `subscription-callbacks` (디렉토리)

- **경로**: `lib/subscription-callbacks/`
- **설명**:
  - 파티룸 WebSocket을 통해 수신되는 다양한 유형의 이벤트들을 각각 처리하는 커스텀 훅들을 모아놓은 디렉토리입니다. 각 훅은 특정 `PartyroomEventType`에 대응하며, `useHandleSubscriptionEvent`에 의해 호출됩니다.
  - 주요 콜백 훅 및 기능:
    - `useChatCallback`: 새로운 채팅 메시지(`ChatEvent`) 수신 시, `current-partyroom` 스토어의 `appendChatMessage` 액션을 호출하여 채팅 목록을 업데이트합니다.
    - `useCrewGradeCallback`: 크루 등급 변경(`CrewGradeEvent`) 수신 시, `current-partyroom` 스토어의 `updateCrews` (크루 목록 업데이트), `updateMe` (자신의 등급 업데이트), `appendChatMessage` (시스템 메시지 추가), `alert.notify` (등급 변경 알림 발생) 등을 호출합니다.
    - `useCrewPenaltyCallback`: 크루 페널티(`CrewPenaltyEvent`) 수신 시, `current-partyroom` 스토어의 `alert.notify`를 호출하여 페널티 알림을 발생시키고, 시스템 메시지를 추가하며, 필요한 경우 현재 사용자 정보를 업데이트합니다.
    - `useCrewProfileCallback`: 크루 프로필 변경(`CrewProfileEvent`) 수신 시, `current-partyroom` 스토어의 `updateCrews`를 호출하여 해당 크루의 프로필 정보(닉네임, 프로필 이미지 등)를 업데이트합니다.
    - `usePartyroomAccessCallback`: 파티룸 접근 관련 이벤트(`PartyroomAccessEvent`, 예: 새로운 유저 입장) 수신 시, `current-partyroom` 스토어의 `addCrew` 또는 `removeCrew`를 호출하고, 시스템 메시지를 추가합니다.
    - `usePartyroomCloseCallback`: 파티룸 종료(`PartyroomCloseEvent`) 수신 시, 사용자를 파티룸 목록 페이지로 이동시키고, `current-partyroom` 스토어를 초기화하며, 관련 React Query 캐시를 제거하고, 파티룸 종료 알림 다이얼로그를 표시합니다.
    - `usePartyroomDeactivationCallback`: 파티룸 비활성화(`PartyroomDeactivationEvent`) 수신 시, 관련 알림을 발생시킵니다. (구체적인 동작은 `current-partyroom` 엔티티의 알림 처리 로직에 따름)
    - `usePartyroomNoticeCallback`: 파티룸 공지 변경(`PartyroomNoticeEvent`) 수신 시, `current-partyroom` 스토어의 `updateNotice`를 호출하여 공지 내용을 업데이트합니다.
    - `usePlaybackStartCallback`: 재생 시작(`PlaybackStartEvent`) 수신 시, `current-partyroom` 스토어의 `updatePlayback`을 호출하여 현재 재생 정보를 업데이트합니다.
    - `usePlaybackSkipCallback`: 재생 건너뛰기(`PlaybackSkipEvent`) 수신 시, `current-partyroom` 스토어의 `updatePlayback`을 호출하여 큐 및 현재 재생 정보를 업데이트하고, 시스템 메시지를 추가합니다.
    - `useReactionAggregationCallback`: 반응 집계(`ReactionAggregationEvent`) 수신 시, `current-partyroom` 스토어의 `updateReactions`를 호출하여 반응 집계 정보를 업데이트합니다.
    - `useReactionMotionCallback`: 반응 모션(`ReactionMotionEvent`) 수신 시, `current-partyroom` 스토어의 `addReactionMotion`을 호출하여 화면에 표시될 반응 모션을 추가합니다.

## 3. 주요 사용 흐름 및 예시

### 3.1. 파티룸 입장 및 이벤트 수신

1.  사용자가 특정 파티룸에 입장하려고 하면, 일반적으로 `PartyroomProvider` (또는 유사한 컨텍스트 프로바이더) 내부에서 `PartyroomClient` 인스턴스가 생성됩니다.
2.  해당 프로바이더는 `PartyroomClientContext.Provider`를 통해 `PartyroomClient` 인스턴스를 하위 컴포넌트에 제공합니다.
3.  `PartyroomClient`의 `connect` 메소드가 호출되어 WebSocket 서버에 연결하고 특정 파티룸 주제를 구독합니다. 이 과정에서 `useHandleSubscriptionEvent` 훅에서 반환된 함수가 `onMessage` 콜백으로 등록됩니다.

    ```tsx
    // 예시: PartyroomProvider.tsx (가상)
    const PartyroomProvider = ({ children, partyroomId, accessToken }) => {
      const partyroomClientRef = useRef<PartyroomClient | null>(null);
      const handleSubscriptionEvent = useHandleSubscriptionEvent(); // 이벤트 핸들러 훅

      useEffect(() => {
        if (!partyroomClientRef.current) {
          partyroomClientRef.current = new PartyroomClient();
        }
        const client = partyroomClientRef.current;

        client
          .connect(partyroomId, accessToken)
          .then(() => {
            client.onMessage(handleSubscriptionEvent); // 메시지 수신 시 이벤트 핸들러 실행
          })
          .catch((error) => console.error('Failed to connect to partyroom', error));

        return () => {
          client.disconnect();
        };
      }, [partyroomId, accessToken, handleSubscriptionEvent]);

      return (
        <PartyroomClientContext.Provider value={partyroomClientRef.current}>
          {children}
        </PartyroomClientContext.Provider>
      );
    };
    ```

4.  서버로부터 파티룸 관련 이벤트 (채팅, 크루 변경 등)가 발생하면, `handleSubscriptionEvent`가 이를 수신합니다.
5.  `handleSubscriptionEvent`는 이벤트의 `eventType`에 따라 적절한 `subscription-callbacks` 내의 훅 (예: `useChatCallback`, `useCrewGradeCallback`)을 호출합니다.
6.  각 콜백 훅은 `current-partyroom` Zustand 스토어의 상태를 업데이트하거나 알림을 발생시키는 등의 작업을 수행합니다. 예를 들어, `useChatCallback`은 새로운 채팅 메시지를 스토어에 추가하고, `useCrewGradeCallback`은 변경된 크루 등급 정보를 스토어에 반영하고 필요한 경우 알림을 트리거합니다.

### 3.2. 채팅 메시지 전송

1.  사용자가 채팅 입력 UI를 통해 메시지를 전송하려고 합니다.
2.  해당 UI 컴포넌트는 `usePartyroomClient` 훅을 사용하여 `PartyroomClient` 인스턴스를 가져옵니다.
3.  `partyroomClient.sendMessage(chatMessage)`를 호출하여 서버로 메시지를 전송합니다.

    ```tsx
    // 예시: ChatInput.tsx (가상)
    import { usePartyroomClient } from '@/entities/partyroom-client';

    const ChatInput = () => {
      const partyroomClient = usePartyroomClient();
      const [message, setMessage] = useState('');

      const handleSubmit = () => {
        if (partyroomClient && message.trim()) {
          partyroomClient.sendMessage(message.trim());
          setMessage('');
        }
      };

      // ... (UI 렌더링)
    };
    ```

## 4. `current-partyroom` 엔티티와의 관계

`partyroom-client`는 WebSocket을 통해 서버와 직접 통신하며 실시간 데이터를 수신하고 전송하는 역할을 담당합니다. 수신된 이벤트 데이터는 주로 `current-partyroom` 엔티티의 Zustand 스토어를 업데이트하는 데 사용됩니다.

- `partyroom-client`의 `subscription-callbacks` 내 훅들은 `current-partyroom` 스토어의 액션(예: `appendChatMessage`, `updateCrews`, `alert.notify`)을 호출하여 파티룸의 상태를 최신으로 유지합니다.
- 반대로, `current-partyroom` 엔티티는 UI 컴포넌트들이 파티룸의 현재 상태(채팅 내역, 크루 목록, 재생 정보 등)를 구독하고, 알림을 수신하여 사용자에게 표시하는 역할을 합니다.

즉, `partyroom-client`는 **데이터 수집 및 서버 통신 계층**에 가깝고, `current-partyroom`은 **상태 관리 및 UI 반영 계층**으로 볼 수 있습니다.
