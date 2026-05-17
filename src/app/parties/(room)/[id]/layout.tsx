'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { useEnterPartyroom } from '@/features/partyroom/enter';
import { useTeardownPartyroom } from '@/features/partyroom/exit';
import { parseEntrySource } from '@/shared/lib/analytics/room-tracking';
import useDidMountEffect from '@/shared/lib/hooks/use-did-mount-effect';

export default function PartyroomLayout({ children }: PropsWithChildren) {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const partyroomId = Number(params.id);
  const entrySource = parseEntrySource(searchParams.get('source'));
  const enter = useEnterPartyroom(partyroomId, { entrySource });
  const teardown = useTeardownPartyroom(partyroomId);

  useDidMountEffect(() => {
    enter();

    // `?source=` 는 진입 attribution 1회 분류용이므로 즉시 제거.
    // 그대로 두면 사용자가 URL을 복사/공유할 때 잘못된 entry_source가 전파됨.
    if (searchParams.get('source')) {
      router.replace(`/parties/${params.id}`, { scroll: false });
    }

    // 언로드/언마운트 시 백엔드 exit(DELETE /crews/me)는 호출하지 않습니다.
    // 비자발적 이탈은 서버의 presence grace window가 처리하므로 beforeunload /
    // pagehide 리스너를 등록하지 않습니다(Cluster A PR-4 L2, #225a/#30 증폭 종결).
    // 언마운트 시에는 클라이언트 정리만 수행하면 충분합니다.
    // NOTE: 하드 언로드(탭 종료/새로고침) 시 partyroom_exited analytics는 의도적으로
    // 누락됩니다(리스너 미등록). 침묵 손실이 아니라 C9/SE3 후속(beacon 전용 재도입)으로 추적합니다.
    return () => {
      teardown();
    };
  });

  return <main className='bg-partyRoom bg-left-bottom overflow-hidden'>{children}</main>;
}
