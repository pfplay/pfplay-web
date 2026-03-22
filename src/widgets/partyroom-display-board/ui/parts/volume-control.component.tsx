'use client';
import { useUserPreferenceStore } from '@/entities/preference';
import { cn } from '@/shared/lib/functions/cn';
import { useHoverPopup } from '@/shared/lib/hooks/use-hover-popup.hook';
import { PFVolumeOff, PFVolumeOn } from '@/shared/ui/icons';

type Props = {
  iconSize?: number;
};

export default function VolumeControl({ iconSize = 16 }: Props) {
  const volume = useUserPreferenceStore((s) => s.volume);
  const muted = useUserPreferenceStore((s) => s.muted);
  const setVolume = useUserPreferenceStore((s) => s.setVolume);
  const setMuted = useUserPreferenceStore((s) => s.setMuted);

  const { open, show, hide } = useHoverPopup();

  const isMuted = muted || volume === 0;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v > 0 && muted) setMuted(false);
    if (v === 0) setMuted(true);
  };

  return (
    <div
      data-testid='volume-control'
      className='relative flex items-center justify-center'
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {/* Vertical slider popup */}
      <div
        data-testid='volume-popup'
        aria-hidden={!open}
        className={cn(
          'absolute bottom-full mb-2 flex flex-col items-center gap-3',
          'bg-[#1a1a1a] border border-gray-700 rounded-xl px-3 py-3',
          'transition-all duration-200',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-1 pointer-events-none'
        )}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <input
          type='range'
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className='accent-white cursor-pointer'
          style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '80px' }}
        />
      </div>

      {/* Volume icon — click to mute/unmute */}
      <button
        onClick={() => setMuted(!muted)}
        aria-label={isMuted ? '음소거 해제' : '음소거'}
        className='text-white hover:text-gray-300 transition-colors'
      >
        {isMuted ? (
          <PFVolumeOff width={iconSize} height={iconSize} />
        ) : (
          <PFVolumeOn width={iconSize} height={iconSize} />
        )}
      </button>
    </div>
  );
}
