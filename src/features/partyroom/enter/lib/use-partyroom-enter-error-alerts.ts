import useOnError from '@/shared/api/http/error/use-on-error.hook';
import { ErrorCode } from '@/shared/api/http/types/@shared';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useDialog } from '@/shared/ui/components/dialog';

/**
 * 파티룸 enter api 에러 발생 시 오는 에러를 친절한 문구로 바꿔 보여줍니다.
 * enter api 에러가 발생하면 로비로 돌아가기 때문에, 이 훅이 안전하게 동작하려면 로비 페이지와 룸 페이지를 묶는 상위 layout에서 사용되어야 합니다.
 */
export default function usePartyroomEnterErrorAlerts() {
  const t = useI18n();
  const { openAlertDialog } = useDialog();

  useOnError(ErrorCode.NOT_FOUND_ROOM, () => {
    openAlertDialog({ content: t.partyroom.ec.shut_down });
  });
  useOnError(ErrorCode.ALREADY_TERMINATED, () => {
    openAlertDialog({ content: t.partyroom.ec.shut_down });
  });
}
