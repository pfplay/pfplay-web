import { useI18n } from '@/shared/lib/localization/i18n.context';
import { TextButton } from '@/shared/ui/components/text-button';
import { Typography } from '@/shared/ui/components/typography';
import { PFArrowLeft, PFClose } from '@/shared/ui/icons';
import { Panel, usePanelController } from '../lib/panel-controller.context';

type Props = {
  onClose: () => void;
};

export default function PanelHeader({ onClose }: Props) {
  const t = useI18n();
  const { currentPanel, goTo } = usePanelController();

  return (
    <div className='flexRowCenter gap-3'>
      {currentPanel !== Panel.Main && (
        <TextButton
          Icon={<PFArrowLeft />}
          onClick={() => {
            goTo(Panel.Main);
          }}
          className='shrink-0'
        />
      )}

      <Typography type='body3' className='flex-1'>
        {t.party.title.party_info}
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
