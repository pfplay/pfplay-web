import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Typography } from '@/shared/ui/components/typography';
import { PFClose } from '@/shared/ui/icons';

type Props = {
  onClose: () => void;
};

export default function PanelHeader({ onClose }: Props) {
  const t = useI18n();
  return (
    <div className='flexRowCenter space-between py-10'>
      <Typography type='title2' className='flex-1 text-start'>
        {t.party.para.party_rooms}
      </Typography>

      <PFClose
        width={24}
        height={24}
        onClick={onClose}
        className='[&_*]:stroke-white cursor-pointer shrink-0'
      />
    </div>
  );
}
