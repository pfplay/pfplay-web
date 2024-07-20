import type { DjListItemUserConfig } from '@/shared/ui/components/dj-list-item';

export type Model = {
  uid: string;
  username: string;
  avatarIconUrl: string;
};

export const toListItemConfig = (model: Model): DjListItemUserConfig => ({
  username: model.username,
  src: model.avatarIconUrl,
});
