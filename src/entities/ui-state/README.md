# UI State

`ui-state` 엔티티는 애플리케이션 전반의 특정 UI 요소들의 상태를 중앙에서 관리합니다. [Zustand](https://github.com/pmndrs/zustand) 라이브러리를 사용하여 간결하고 효율적인 상태 관리를 구현합니다.

현재는 주로 `playlistDrawer` (플레이리스트 상세 정보를 보여주는 Drawer 컴포넌트)의 상태를 관리합니다.

## 주요 기능 및 사용 예시

### 1. UI 상태 모델 정의 (`./model/ui-state.model.tsx`)

애플리케이션에서 사용될 UI 상태의 타입과 해당 상태를 업데이트하는 함수의 타입을 정의합니다.

```tsx
// src/entities/ui-state/model/ui-state.model.tsx
import { Playlist } from '@/shared/api/http/types/playlists';
import type { Next } from '@/shared/lib/functions/update';

type PlaylistDrawerState = {
  open: boolean; // Drawer 열림 여부
  interactable: boolean; // Drawer와 상호작용 가능 여부
  zIndex: number; // Drawer의 z-index 값
  selectedPlaylist: Playlist | undefined; // 현재 선택/표시된 플레이리스트 정보
};

export type Model = {
  playlistDrawer: PlaylistDrawerState;
  setPlaylistDrawer: (v: Next<PlaylistDrawerState>) => void; // playlistDrawer 상태 업데이트 함수
};
```

### 2. UI 상태 스토어 생성 (`./model/ui-state.store.tsx`)

`createUIStateStore` 함수는 Zustand의 `create` 함수를 사용하여 실제 상태와 액션을 갖는 스토어를 생성합니다.

- `playlistDrawer`: 초기 상태 값을 가집니다.
- `setPlaylistDrawer`: `playlistDrawer` 상태를 업데이트하는 액션입니다. Drawer가 닫힐 때(`open: false`)는 `interactable`, `zIndex`, `selectedPlaylist` 등의 관련 상태를 초기값으로 리셋하는 로직을 포함합니다.

```tsx
// src/entities/ui-state/model/ui-state.store.tsx
import { create } from 'zustand';
import { update } from '@/shared/lib/functions/update';
import theme from '@/shared/ui/foundation/theme';
import * as UIState from './ui-state.model';

export const createUIStateStore = () => {
  return create<UIState.Model>((set, get, api) => ({
    playlistDrawer: {
      open: false,
      interactable: true,
      zIndex: theme.zIndex.drawer,
      selectedPlaylist: undefined,
    },
    setPlaylistDrawer: (v) => {
      set((state) => {
        const updated = update(state.playlistDrawer, v);
        // ... (Drawer 닫힘 시 관련 상태 초기화 로직)
        return { playlistDrawer: updated };
      });
    },
  }));
};
```

### 3. 스토어 제공 및 사용 (`StoresProvider`, `useStores`)

생성된 UI 상태 스토어는 `src/app/_providers/stores.provider.tsx`의 `StoresProvider`를 통해 애플리케이션 전역으로 제공됩니다. 컴포넌트에서는 `useStores` 훅을 통해 `useUIState` 스토어에 접근하여 상태를 읽거나 액션을 호출할 수 있습니다.

```tsx
// src/app/_providers/stores.provider.tsx
import { UIState, createUIStateStore } from '@/entities/ui-state';
import { StoresContext, Stores } from '@/shared/lib/store/stores.context';

declare module '@/shared/lib/store/stores.context' {
  interface Stores {
    useUIState: UseBoundStore<StoreApi<UIState.Model>>;
    // ... 다른 스토어들
  }
}

export default function StoresProvider({ children }) {
  // ...
  if (storesRef.current === null) {
    storesRef.current = {
      useUIState: createUIStateStore(),
      // ...
    };
  }
  return <StoresContext.Provider value={storesRef.current}>{children}</StoresContext.Provider>;
}
```

**사용 예시: `MyPlaylist` 위젯에서 플레이리스트 Drawer 상태 제어**

`MyPlaylist` 컴포넌트에서는 `useStores`를 통해 `playlistDrawer`의 상태(`open`, `interactable`, `zIndex`, `selectedPlaylist`)를 읽어와 Drawer UI를 렌더링하고, `setPlaylistDrawer` 액션을 호출하여 Drawer를 열고 닫거나 선택된 플레이리스트를 변경합니다.

```tsx
// src/widgets/my-playlist/ui/my-playlist.component.tsx
import { useStores } from '@/shared/lib/store/stores.context';
import { Drawer, DrawerProps } from '@/shared/ui/components/drawer'; // 예시 Drawer 컴포넌트
import { Playlist } from '@/shared/api/http/types/playlists';

export default function MyPlaylist() {
  const { useUIState } = useStores();
  const { playlistDrawer, setPlaylistDrawer } = useUIState();
  // ... (playlists 데이터 로딩 등)

  const containerCommonProps: DrawerProps = {
    title: '내 플레이리스트',
    isOpen: playlistDrawer.open,
    close: playlistDrawer.interactable ? () => setPlaylistDrawer({ open: false }) : undefined,
    style: { zIndex: playlistDrawer.zIndex },
  };

  const selectPlaylist = (playlist: Playlist) => {
    setPlaylistDrawer({
      open: true, // 플레이리스트 선택 시 Drawer를 열도록 상태 변경
      selectedPlaylist: playlist,
    });
  };

  // ... (useEffect를 사용하여 selectedPlaylist 동기화 등)

  return (
    <Drawer {...containerCommonProps}>
      {/* 선택된 플레이리스트 상세 정보 (playlistDrawer.selectedPlaylist) 표시 */}
      {/* 플레이리스트 목록을 보여주고, 클릭 시 selectPlaylist(playlist) 호출 */}
    </Drawer>
  );
}
```

**사용 예시: 다이얼로그 `z-index` 관리**

다른 기능(예: 플레이리스트 추가/편집)을 위한 다이얼로그가 `playlistDrawer` 위에 표시되어야 할 경우, `playlistDrawer.zIndex`를 참조하여 다이얼로그의 `zIndex`를 동적으로 설정합니다.

```tsx
// src/features/playlist/add/ui/form.component.tsx
import { useStores } from '@/shared/lib/store/stores.context';
import { useDialog } from '@/shared/ui/components/dialog';

export default function useAddPlaylistDialog() {
  const { openDialog } = useDialog();
  const { useUIState } = useStores();
  const playlistDrawer = useUIState((state) => state.playlistDrawer);

  return () => {
    openDialog((_, onCancel) => ({
      zIndex: playlistDrawer.zIndex + 1, // playlistDrawer보다 높은 zIndex 설정
      title: '플레이리스트 추가',
      // ...
    }));
  };
}
```
