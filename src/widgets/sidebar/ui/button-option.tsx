'use client';

import { useSuspenseFetchMe } from '@/entities/me';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Profile } from '@/shared/ui/components/profile';
import { Typography } from '@/shared/ui/components/typography';
import { PFHeadset } from '@/shared/ui/icons';

type ButtonProps = {
  text: string;
  onClick: () => void;
  Icon: React.ReactNode;
  disabled?: boolean;
};

export function SidebarButton({ onClick, text, Icon, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} className='gap-2 cursor-pointer flexColCenter' disabled={disabled}>
      {Icon}
      <Typography type='caption1' className='text-gray-200'>
        {text}
      </Typography>
    </button>
  );
}

export function ProfileButton({ onClick }: Pick<ButtonProps, 'onClick'>) {
  const { data: me } = useSuspenseFetchMe();
  const t = useI18n();

  return (
    <SidebarButton
      onClick={onClick}
      text={t.common.btn.my_profile}
      Icon={<Profile size={48} src={me.avatarIconUri} />}
    />
  );
}

export function PlaylistButton({ onClick }: Pick<ButtonProps, 'onClick'>) {
  const t = useI18n();

  return (
    <SidebarButton
      onClick={onClick}
      text={t.common.btn.playlist}
      Icon={<PFHeadset width={36} height={36} className='[&_*]:fill-gray-400' />}
    />
  );
}
