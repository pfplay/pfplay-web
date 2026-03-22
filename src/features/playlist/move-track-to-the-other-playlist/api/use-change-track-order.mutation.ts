import { useMutation } from '@tanstack/react-query';
import { playlistsService } from '@/shared/api/http/services';
import { ChangeTrackOrderRequest } from '@/shared/api/http/types/playlists';

export default function useChangeTrackOrder() {
  return useMutation({
    mutationFn: (params: ChangeTrackOrderRequest) =>
      playlistsService.changeTrackOrderInPlaylist(params),
    onSuccess: () => {
      /**
       * NOTE
       *  순서 변경 할 때마다 invalidate하면, refetch 도중 찰나에 또 순서 변경 시
       *  클라이언트 측에서 변경한 상태가 refetch 결과에 의해 일순간 롤백되는 듯 보이는 문제가 있으므로 invalidate 하지 않음
       */
      // queryClient.invalidateQueries({ queryKey: [QueryKeys.PlaylistTracks, variables.playlistId] });
    },
  });
}
