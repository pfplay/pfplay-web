import { PropsWithChildren } from 'react';

// type Button = {
//   onClick: () => void;
//   icon: (size: number, className: string) => ReactNode;
//   text: string;
//   disabled?: boolean;
// };

type SidebarProps = {
  className: string;
};

export default function Sidebar({ className, children }: PropsWithChildren<SidebarProps>) {
  return (
    <aside className={className}>
      {/* <ProfileButton onClick={handleClickProfileButton} text={t.common.btn.my_profile} />
      <PlaylistButton onClick={togglePlaylist} text={t.common.btn.playlist} /> */}

      {/* {buttons.map((button) => (
        <button
          key={'sidebar-button' + button.text}
          onClick={button.onClick}
          className={cn('gap-2 cursor-pointer flexColCenter', {
            'cursor-not-allowed opacity-50': button.disabled,
          })}
          disabled={button.disabled}
        >
          {button.icon(36, 'text-gray-400')}
          <Typography type='caption1' className='text-gray-200'>
            {button.text}
          </Typography>
        </button>
      ))} */}
      {children}
    </aside>
  );
}
