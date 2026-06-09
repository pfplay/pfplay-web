import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { TrackTitle } from '@/shared/ui/components/track-title';

export default function VideoTitle() {
  const t = useI18n();
  const { useCurrentPartyroom } = useStores();
  const playback = useCurrentPartyroom((state) => state.playback);

  return <TrackTitle name={playback?.name} emptyText={t.dj.para.empty_dj} />;
}
