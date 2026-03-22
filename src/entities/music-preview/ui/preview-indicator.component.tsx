import { PFAudioWave } from '@/shared/ui/icons';

type PreviewIndicatorProps = {
  className?: string;
};

/**
 * 재생중 상태를 표시하는 인디케이터
 * 썸네일 위에 불투명한 레이어와 함께 표시됨
 */
export default function PreviewIndicator({ className }: PreviewIndicatorProps) {
  return (
    <div
      className={`absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center ${className || ''}`}
    >
      <PFAudioWave width={32} height={32} className='text-white' />
    </div>
  );
}
