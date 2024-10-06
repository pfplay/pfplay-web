import { Dj } from '@/entities/current-partyroom';
import { useCanLockDjingQueue, useLockDjingQueue } from '@/features/partyroom/lock-djing-queue';
import SkipPlayback from '@/features/partyroom/skip-playback';
import {
  useCanUnlockDjingQueue,
  useUnlockDjingQueue,
} from '@/features/partyroom/unlock-djing-queue';
import { QueueStatus } from '@/shared/api/http/types/@enums';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button, ButtonProps } from '@/shared/ui/components/button';
import { DjListItem } from '@/shared/ui/components/dj-list-item';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose } from '@/shared/ui/icons';
import RegisterButton from './register-button.component';
import UnregisterButton from './unregister-button.component';
import { useDjingQueue } from '../lib/djing-queue.context';

type Props = {
  onCancel: () => void | undefined;
};

export default function Body({ onCancel }: Props) {
  const djingQueue = useDjingQueue();
  if (!djingQueue.djs.length) {
    throw new Error('dj must set before render this component');
  }

  const t = useI18n();
  const myCrewId = useStores().useCurrentPartyroom((state) => state.me?.crewId);
  const [currentDj, ...queue] = djingQueue.djs
    .slice()
    .sort((a, b) => a.orderNumber - b.orderNumber);
  const isMeInQueue = queue.some((dj) => dj.crewId === myCrewId);

  const lockDjQueue = useLockDjingQueue();
  const unlockDjQueue = useUnlockDjingQueue();
  const canLockDjQueue = useCanLockDjingQueue();
  const canUnLockDjQueue = useCanUnlockDjingQueue();
  const isLocked = djingQueue.queueStatus === QueueStatus.CLOSE;

  return (
    <div className='text-start'>
      <header className='flex'>
        <div className='pt-[12px]' style={{ width: LEFT_PAD }}>
          <Typography type='title2'>{t.dj.title.current_dj}</Typography>
        </div>

        <div className='flex-1 flexCol gap-[12px]'>
          <div className='flex items-center gap-[12px] p-[12px] bg-gray-700 rounded'>
            <Typography type='body3' className='flex-1'>
              {djingQueue.playback?.name}
            </Typography>
            <div className='inline-flex items-center gap-2'>
              {/* FIXME: playback 재생 시간 표시 필요 */}
              <Typography type='detail1'>03:00</Typography>
              <SkipPlayback>
                {(skipPlayback) => (
                  <TextButton
                    onClick={skipPlayback}
                    className='text-gray-50 px-3'
                    typographyType='caption1'
                  >
                    {t.common.btn.skip}
                  </TextButton>
                )}
              </SkipPlayback>
            </div>
          </div>

          <DjListItem variant='accent' userConfig={Dj.toListItemConfig(currentDj)} />
        </div>

        <div className='pt-[12px] flex justify-end' style={{ width: RIGHT_PAD }}>
          <Button
            color='secondary'
            variant='outline'
            Icon={<PFClose width={24} height={24} />}
            className='border-none p-0'
            onClick={onCancel}
          />
        </div>
      </header>

      <div
        className='h-[1px] my-[20px] bg-gray-600'
        style={{ width: `calc(100% - ${RIGHT_PAD}px)` }}
      />

      <div className='flex' style={{ width: `calc(100% - ${RIGHT_PAD}px)` }}>
        <div style={{ width: LEFT_PAD }}>
          <Typography type='body2'>{t.dj.title.dj_queue}</Typography>

          {(canLockDjQueue || canUnLockDjQueue) && (
            <div className='mt-4 flex flex-col items-start gap-3'>
              {!isLocked && canLockDjQueue && (
                <Button {...leftButtonProps} onClick={lockDjQueue}>
                  {t.common.btn.lock}
                </Button>
              )}
              {isLocked && canUnLockDjQueue && (
                <Button {...leftButtonProps} onClick={unlockDjQueue}>
                  {t.common.btn.unlock}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className='flex-1 h-[240px] overflow-y-auto'>
          {!queue?.length && (
            <Typography type='detail2' className='text-gray-200'>
              -
            </Typography>
          )}
          {!!queue?.length &&
            queue.map((dj, index) => {
              const isMe = dj.crewId === myCrewId;

              return (
                <div key={'queue' + dj.crewId} className='flex justify-between items-center'>
                  {/* TODO: 각 리스트에 삭제 버튼이 있어야 함. User List Item 컴포넌트로 대체 해야 할 지 고민해보기 */}
                  <DjListItem
                    order={`${index + 1}`}
                    userConfig={Dj.toListItemConfig(dj)}
                    suffixTagValue={isMe ? 'Me' : undefined}
                  />

                  {isMe && (
                    <Button
                      color='primary'
                      variant='outline'
                      size='sm'
                      onClick={() => alert('Not Impl')}
                    >
                      {t.playlist.btn.change_playlist}
                    </Button>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <div
        className='flex justify-between items-end mt-[16px]'
        style={{ width: `calc(100% - ${RIGHT_PAD}px)` }}
      >
        <Typography type='caption1'>
          {replaceVar(t.dj.title.time_limit, {
            $1: (
              <Typography type='detail2' as='span' className='text-red-300'>
                N
              </Typography>
            ),
          })}
        </Typography>

        {isMeInQueue ? <UnregisterButton /> : <RegisterButton />}
      </div>
    </div>
  );
}

const LEFT_PAD = 150;
const RIGHT_PAD = 64;

const leftButtonProps: ButtonProps = {
  size: 'sm',
  color: 'secondary',
  variant: 'outline',
};
