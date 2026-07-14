'use client';
import { useEffect, useRef } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';
import { PFEmoji } from '@/shared/ui/icons';
import { CHAT_EMOJIS } from '../lib/emoji-set';
import useRecentEmojis from '../lib/use-recent-emojis.hook';

type Props = {
  /** 선택된 이모지 1개 전달 — 호출 측에서 message에 append */
  onSelect: (emoji: string) => void;
  /** 패널이 닫힌 뒤 호출 — 입력창 포커스 복귀용.
   *  선택 시점에 포커스를 옮기면 Popover가 focus-out으로 닫혀버리므로 닫힘 이후에만 복귀시킨다. */
  onClosed?: () => void;
  disabled?: boolean;
};

export default function ChatEmojiPicker({ onSelect, onClosed, disabled }: Props) {
  const t = useI18n();
  const { recents, addRecent } = useRecentEmojis();

  const handleSelect = (emoji: string) => {
    onSelect(emoji);
    addRecent(emoji);
  };

  return (
    <Popover className='flex items-center'>
      {({ open }) => (
        <>
          <ClosedWatcher open={open} onClosed={onClosed} />

          <PopoverButton
            data-testid='chat-emoji-trigger'
            aria-label={t.chat.btn.choose_emoji}
            disabled={disabled}
            className='flex items-center justify-center w-[32px] h-[32px] rounded-[4px] text-gray-300 enabled:hover:text-gray-50 disabled:opacity-40 focus:outline-none focus-visible:interaction-outline'
          >
            <PFEmoji width={20} height={20} />
          </PopoverButton>

          <PopoverPanel
            data-testid='chat-emoji-panel'
            anchor='top end'
            className='z-50 w-max rounded-[8px] border border-gray-700 bg-gray-800 p-[12px] shadow-lg focus:outline-none [--anchor-gap:8px]'
          >
            {recents.length > 0 && (
              <div className='mb-[8px]'>
                <Typography type='caption1' className='block text-gray-400 mb-[4px]'>
                  {t.chat.title.recently_used}
                </Typography>
                <div data-testid='chat-emoji-recents' className='flex items-center gap-[2px]'>
                  {recents.map((emoji) => (
                    <EmojiButton key={emoji} emoji={emoji} onClick={handleSelect} />
                  ))}
                </div>
                <div className='border-t border-gray-700 mt-[8px]' />
              </div>
            )}

            <div
              data-testid='chat-emoji-grid'
              className='grid grid-cols-8 gap-[2px] max-h-[204px] overflow-y-auto'
            >
              {CHAT_EMOJIS.map((emoji) => (
                <EmojiButton key={emoji} emoji={emoji} onClick={handleSelect} />
              ))}
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}

function EmojiButton({ emoji, onClick }: { emoji: string; onClick: (emoji: string) => void }) {
  return (
    <button
      type='button'
      onClick={() => onClick(emoji)}
      className='flex items-center justify-center w-[32px] h-[32px] rounded-[4px] text-[20px] leading-none hover:bg-gray-700'
    >
      {emoji}
    </button>
  );
}

/** open true→false 전이 감지 — 닫힘 이후 포커스 복귀 콜백 */
function ClosedWatcher({ open, onClosed }: { open: boolean; onClosed?: () => void }) {
  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (prevOpenRef.current && !open) {
      onClosed?.();
    }
    prevOpenRef.current = open;
  }, [open, onClosed]);

  return null;
}
