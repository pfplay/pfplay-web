import { Dj, useCurrentPartyroom } from '@/entities/current-partyroom';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { replaceVar } from '@/shared/lib/localization/split-render';
import { Button } from '@/shared/ui/components/button';
import { DjListItem } from '@/shared/ui/components/dj-list-item';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose } from '@/shared/ui/icons';
import RegisterButton from './register-button.component';

type Props = {
  onCancel: () => void | undefined;
};

export default function Body({ onCancel }: Props) {
  const { djing } = useCurrentPartyroom();
  if (!djing.current) {
    throw new Error('djing.current must set before render this component');
  }

  const t = useI18n();

  return (
    <div className='text-start'>
      <header className='flex'>
        <div className='pt-[12px]' style={{ width: LEFT_PAD }}>
          <Typography type='title2'>{t.dj.title.current_dj}</Typography>
        </div>

        <div className='flex-1 flexCol gap-[12px]'>
          <div className='flex items-center gap-[12px] p-[12px] bg-gray-700 rounded'>
            <Typography type='body3' className='flex-1'>
              BLACKPINK Shut Down Lyrics (블랙핑크 Shut Down 가사) [Color Coded Lyrics/Han/Rom/Eng]
            </Typography>
            <Typography type='detail1'>03:00</Typography>
          </div>

          <DjListItem variant='accent' userConfig={Dj.toListItemConfig(djing.current.dj)} />
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
        </div>

        <div className='flex-1 h-[240px] overflow-y-auto'>
          {!djing.queue?.length && (
            <Typography type='detail2' className='text-gray-200'>
              -
            </Typography>
          )}
          {!!djing.queue?.length &&
            djing.queue.map((dj, index) => (
              <DjListItem order={`${index + 1}`} userConfig={Dj.toListItemConfig(dj)} />
            ))}
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

        <RegisterButton />
      </div>
    </div>
  );
}

const LEFT_PAD = 150;
const RIGHT_PAD = 64;
