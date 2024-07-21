import type { Dj } from '@/shared/api/http/types/partyrooms';
import type { DjListItemUserConfig } from '@/shared/ui/components/dj-list-item';

export const toListItemConfig = (model: Dj): DjListItemUserConfig => ({
  username: model.nickname,
  src: model.avatarIconUri,
});
