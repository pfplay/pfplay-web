import { useMutation } from '@tanstack/react-query';
import { useInvalidatePlaylistQuery } from './usePlaylistQuery';

export const useDeletePlaylistMutation = () => {
  const invalidatePlaylistQuery = useInvalidatePlaylistQuery();
  return useMutation({
    mutationFn: (ids: number[]) => {
      alert(ids);
      // TODO: API 연동
      return Promise.resolve();
    },
    onSuccess: () => invalidatePlaylistQuery(),
  });
};
