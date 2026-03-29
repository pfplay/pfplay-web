'use client';
import { Avatar } from '@/entities/avatar';
import { BASE_SCALE, BASE_X, BASE_Y } from '@/entities/avatar/config/base-size';
import { Crew } from '@/entities/current-partyroom';
// @ts-expect-error 아이콘 컴포넌트 미생성 상태
import { PFChatOutlineOff, PFDefault, PFFull, PFTheater } from '@/shared/ui/icons';
import ActionButtons from './action-buttons.component';
import VideoTitle from './video-title.component';
import VolumeControl from './volume-control.component';

type Props = {
  djCrew: Crew.Model | undefined;
  isFullscreen: boolean;
  cinemaChatOpen: boolean;
  onDefault: () => void;
  onFull: () => void;
  onToggleChat: () => void;
};

export default function CinemaFooter({
  djCrew,
  isFullscreen,
  cinemaChatOpen,
  onDefault,
  onFull,
  onToggleChat,
}: Props) {
  return (
    <div className='relative'>
      {/* DJ avatar card + volume control */}
      {djCrew && (
        <div className='absolute bottom-3 left-6 flex items-end gap-3'>
          <div className='w-[120px] h-[160px] bg-[#111] rounded-xl overflow-hidden relative'>
            <div className='absolute top-2 left-0 right-0 text-center z-10'>
              <span className='text-white text-sm font-bold leading-none'>{djCrew.nickname}</span>
            </div>
            <Avatar
              height={160}
              bodyUri={djCrew.avatarBodyUri}
              compositionType={djCrew.avatarCompositionType}
              faceUri={djCrew.avatarFaceUri}
              facePosX={djCrew.combinePositionX}
              facePosY={djCrew.combinePositionY}
              offsetX={djCrew.offsetX || BASE_X}
              offsetY={djCrew.offsetY || BASE_Y}
              scale={djCrew.scale || BASE_SCALE}
            />
          </div>
        </div>
      )}

      {/* Title + reactions + mode buttons */}
      <div className='flex items-center gap-10 pl-[184px] pr-6 py-3'>
        {/* Volume control */}
        <div className='pb-1'>
          <VolumeControl iconSize={24} />
        </div>
        <div className='flex-1 min-w-0 relative'>
          <div className='bg-black border-2 border-gray-800 rounded p-5 w-full'>
            <VideoTitle />
          </div>
          <div className='absolute right-0 top-0 bottom-0 bg-black border-l-2 border-t-2 border-b-2 border-gray-800 flex items-center gap-1 p-[6px]'>
            <ActionButtons />
          </div>
        </div>

        <div className='flex items-center gap-3 shrink-0'>
          <button
            onClick={onDefault}
            className='flex flex-col items-center gap-1 w-11 cursor-pointer hover:opacity-80 transition-opacity'
            title='Default'
          >
            <PFDefault width={24} height={24} className='text-gray-300' />
            <span className='text-gray-300 text-xs'>Default</span>
          </button>
          {isFullscreen ? (
            <button
              onClick={() => document.exitFullscreen()}
              className='flex flex-col items-center gap-1 w-11 cursor-pointer hover:opacity-80 transition-opacity'
              title='Theater'
            >
              <PFTheater width={24} height={24} className='text-gray-300' />
              <span className='text-gray-300 text-xs'>Theater</span>
            </button>
          ) : (
            <>
              <button
                onClick={onFull}
                className='flex flex-col items-center gap-1 w-11 cursor-pointer hover:opacity-80 transition-opacity'
                title='Full'
              >
                <PFFull width={24} height={24} className='text-gray-300' />
                <span className='text-gray-300 text-xs'>Full</span>
              </button>
              <button
                onClick={onToggleChat}
                className='flex flex-col items-center gap-1 w-11 cursor-pointer hover:opacity-80 transition-opacity'
                title='Chat'
              >
                {cinemaChatOpen ? (
                  <svg
                    width={24}
                    height={24}
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='text-gray-300'
                  >
                    <path
                      d='M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z'
                      fill='currentColor'
                    />
                  </svg>
                ) : (
                  <PFChatOutlineOff width={24} height={24} className='text-gray-300' />
                )}
                <span className='text-gray-300 text-xs'>Chat</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
