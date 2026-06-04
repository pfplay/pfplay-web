'use client';
import { useIsGuest } from '@/entities/me';
import { useInformSocialType } from '@/features/sign-in/by-social';
import { Language } from '@/shared/lib/localization/constants';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useLang } from '@/shared/lib/localization/lang.context';
import { useDialog } from '@/shared/ui/components/dialog';
import CreatePartyroomForm from '../ui/form.component';

/**
 * "Be a PFPlay Host" 클릭 핸들러 (데스크탑 카드 + 모바일 카드 공유).
 *
 * - 게스트(GT) → 소셜 로그인 유도 모달(informSocialType), 생성 다이얼로그 미오픈.
 *   (AM/FM 모두 생성 가능 — backend PartyroomCreationPolicy = FM|AM. 지갑 게이트 없음.)
 * - 멤버 → 파티룸 생성 다이얼로그(CreatePartyroomForm).
 *
 * 데스크탑 `card.component.tsx` 의 인라인 핸들러를 추출 — 동작 동일.
 */
export default function useBeAHost(): () => Promise<void> {
  const t = useI18n();
  const lang = useLang();
  const { openDialog, openConfirmDialog } = useDialog();
  const isGuest = useIsGuest();
  const informSocialType = useInformSocialType();

  return async () => {
    if (await isGuest()) {
      informSocialType();
      return;
    }

    openDialog((_, onCancel) => ({
      title: t.createparty.title.create_party,
      titleAlign: 'left',
      showCloseIcon: true,
      closeConfirm: () => {
        const [title, content] = t.createparty.para.cancel_confirm.split('\n');
        return openConfirmDialog({
          title,
          content,
        });
      },
      classNames: {
        container: lang === Language.Ko ? 'w-[800px]' : 'w-[900px]',
      },
      Body: () => <CreatePartyroomForm onSuccess={onCancel} />,
    }));
  };
}
