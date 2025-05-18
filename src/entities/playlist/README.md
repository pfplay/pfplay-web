# Playlist

`playlist` 엔티티는 사용자의 플레이리스트 생성, 수정, 삭제 및 플레이리스트 내 트랙 관리 기능을 제공합니다. `PlaylistForm` 컴포넌트를 통해 플레이리스트 이름 입력을 처리하고, `PlaylistActionContext`를 통해 플레이리스트 및 트랙 관련 다양한 액션들을 하위 컴포넌트에 제공합니다.

## 주요 기능 및 사용 예시

### 1. 플레이리스트 폼 모델 및 UI (`./model/playlist-form.model.ts`, `./ui/playlist-form.component.tsx`)

- **`PlaylistForm.model`**: 플레이리스트 생성/수정 폼의 데이터 모델(`name`)과 [Zod](https://github.com/colinhacks/zod)를 사용한 유효성 검사 스키마를 정의합니다.

- **`PlaylistForm` 컴포넌트**: `react-hook-form`과 Zod 스키마를 사용하여 플레이리스트 이름 입력 폼을 제공합니다. 폼 제출 시 `onSubmit` 콜백을, 취소 시 `onCancel` 콜백을 실행합니다.

  **사용 예시: 플레이리스트 추가/수정 다이얼로그 내 폼 사용**

### 2. 플레이리스트 액션 컨텍스트 (`./lib/playlist-action.context.tsx`)

`PlaylistActionContext`는 플레이리스트 및 트랙과 관련된 다양한 액션들을 중앙에서 관리하고, `usePlaylistAction` 훅을 통해 하위 컴포넌트에서 이러한 액션들을 쉽게 사용할 수 있도록 제공합니다.

- **`PlaylistAction` 타입**: 컨텍스트가 제공하는 값의 타입을 정의하며, 다음을 포함합니다:
  - `list`: 현재 사용자의 플레이리스트 목록.
  - `add`: 새 플레이리스트 추가 다이얼로그를 여는 함수.
  - `edit`: 기존 플레이리스트 수정 다이얼로그를 여는 함수.
  - `remove`: 특정 플레이리스트(들)를 삭제하는 함수.
  - `addTrack`: 특정 플레이리스트에 트랙을 추가하는 함수.
  - `removeTrack`: 특정 플레이리스트에서 트랙을 삭제하는 함수.
  - `changeTrackOrder`: 플레이리스트 내 트랙 순서를 변경하는 함수.
- **`PlaylistActionProvider` (`src/app/parties/playlist-action.provider.tsx`)**: 실제 액션 함수들과 플레이리스트 데이터를 `PlaylistActionContext.Provider`를 통해 제공하는 컴포넌트입니다. 이 Provider 내부에서 각 액션에 해당하는 API 호출 훅들(예: `useFetchPlaylists`, `useAddPlaylistDialog`, `useRemovePlaylistTrack` 등)을 사용하여 컨텍스트 값을 구성합니다.

**사용 예시: 플레이리스트 목록 표시 및 수정/삭제 액션 호출**

`features/playlist/list/ui/editable-list.component.tsx`에서는 `usePlaylistAction` 훅을 사용하여 플레이리스트 목록(`playlistAction.list`)을 가져와 화면에 표시하고, 각 플레이리스트에 대한 수정(`playlistAction.edit`) 및 삭제(`playlistAction.remove` - `RemovePlaylistButton` 내부에서 호출) 액션을 제공합니다.

```tsx
// src/features/playlist/list/ui/editable-list.component.tsx
import { usePlaylistAction } from '@/entities/playlist';

export default function EditableList(
  {
    /* ... */
  }
) {
  const playlistAction = usePlaylistAction();

  return (
    <div>
      {playlistAction.list.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          {/* 수정 버튼 */}
          <button onClick={() => playlistAction.edit(item.id)}>수정</button>
          {/* 삭제는 RemovePlaylistButton 컴포넌트를 통해 처리 */}
        </div>
      ))}
    </div>
  );
}
```

**사용 예시: 플레이리스트 내 트랙 순서 변경 및 삭제**

`features/playlist/list-tracks/ui/tracks.component.tsx`에서는 `usePlaylistAction`을 통해 `removeTrack`과 `changeTrackOrder` 액션을 사용합니다. 사용자는 트랙을 드래그 앤 드롭하여 순서를 변경할 수 있으며 (`changeTrackOrder` 호출), 각 트랙의 메뉴를 통해 특정 트랙을 삭제할 수 있습니다 (`removeTrack` 호출).

```tsx
// src/features/playlist/list-tracks/ui/tracks.component.tsx
import { usePlaylistAction } from '@/entities/playlist';
// ... (DndContext, SortableContext 등 dnd-kit 관련 import)

const TracksInPlaylist = ({ playlist }) => {
  const playlistAction = usePlaylistAction();
  // ... (드래그 앤 드롭 로직 및 상태 관리)

  const handleDragEnd = async (event: DragEndEvent) => {
    // ... (순서 변경 로직)
    await playlistAction.changeTrackOrder({
      playlistId: playlist.id,
      trackId: activeTrack.trackId,
      nextOrderNumber: newIndex + 1,
    });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* ... */}
      {items.map((track) => (
        <Track
          key={track.linkId}
          track={track}
          menuItems={[
            {
              onClickItem: () => playlistAction.removeTrack(playlist.id, track.trackId),
              label: '트랙 삭제',
            },
          ]}
        />
      ))}
      {/* ... */}
    </DndContext>
  );
};
```
