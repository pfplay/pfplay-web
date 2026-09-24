'use client';

import { FC, ReactNode } from 'react';
import { useFetchMe } from '@/entities/me/api/use-fetch-me.query';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import { PFHeadset, PFDj, PFLink } from '@/shared/ui/icons';

type Props = {
  onOpenQueue: () => void;
  onOpenProfile?: () => void;
  onOpenPlaylists?: () => void;
  onShare?: () => void;
};

const MobileRoomActionBar: FC<Props> = ({
  onOpenQueue,
  onOpenProfile = () => undefined,
  onOpenPlaylists = () => undefined,
  onShare = () => undefined,
}) => {
  const t = useI18n();

  return (
    <nav
      aria-label={t.common.menu.title}
      className='absolute inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+24px)] z-40 grid grid-cols-4 rounded-[42px] bg-[#FFFFFF14] px-3 py-4 backdrop-blur-[20px]'
    >
      <ProfileActionButton label={t.common.btn.my_profile} onClick={onOpenProfile} />
      <ActionButton label={t.common.btn.playlist} onClick={onOpenPlaylists}>
        <PFHeadset width={32} height={32} className='text-gray-300' />
      </ActionButton>
      <ActionButton label={t.dj.title.dj_queue} onClick={onOpenQueue}>
        <PFDj width={32} height={32} className='text-gray-300' />
      </ActionButton>
      <ActionButton label={t.common.btn.share} onClick={onShare}>
        <PFLink width={32} height={32} className='[&_*]:stroke-gray-300' />
      </ActionButton>
    </nav>
  );
};

function ProfileActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  const { data: me } = useFetchMe();

  return (
    <ActionButton label={label} onClick={onClick}>
      <Profile src={me?.avatarIconUri} size={32} />
    </ActionButton>
  );
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type='button'
      aria-label={label}
      onClick={onClick}
      className='flex min-w-0 flex-col items-center justify-center gap-1 text-gray-200 active:scale-95'
    >
      <span className='flex h-10 items-center justify-center'>{children}</span>
      <Typography type='caption2' className='truncate leading-[1.5] text-gray-200'>
        {label}
      </Typography>
    </button>
  );
}

export default MobileRoomActionBar;
