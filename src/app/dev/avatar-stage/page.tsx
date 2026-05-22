'use client';

import { startTransition, useEffect, useState } from 'react';
import { AvatarCompositionType, GradeType, MotionType } from '@/shared/api/http/types/@enums';
import { useStores } from '@/shared/lib/store/stores.context';
import { PartyroomAvatars } from '@/widgets/partyroom-avatars';

function makeCrew(crewId: number, nickname: string, motionType: MotionType = MotionType.NONE) {
  return {
    crewId,
    nickname,
    gradeType: crewId === 1 ? GradeType.HOST : GradeType.CLUBBER,
    avatarCompositionType: AvatarCompositionType.BODY_WITH_FACE,
    avatarBodyUri: '/images/Temp/body.png',
    avatarFaceUri: '/images/Temp/face.png',
    avatarIconUri: '/images/Temp/nft.png',
    combinePositionX: 60,
    combinePositionY: 9,
    offsetX: crewId % 3 === 0 ? 0.04 : crewId % 3 === 1 ? -0.04 : 0,
    offsetY: crewId % 4 === 0 ? 0.02 : 0,
    scale: 1,
    motionType,
  };
}

function buildCrews(queueCount: number, listenerCount: number) {
  const queueCrewIds = Array.from({ length: 20 }, (_, index) => index + 2).slice(0, queueCount);
  const listenerCrewIds = Array.from({ length: 50 }, (_, index) => index + 100).slice(
    0,
    listenerCount
  );

  const crews = [
    makeCrew(1, 'DJ Mono'),
    ...queueCrewIds.map((crewId) => makeCrew(crewId, `Queue ${crewId}`)),
    ...listenerCrewIds.map((crewId, index) =>
      makeCrew(
        crewId,
        `Floor ${crewId}`,
        index % 5 === 0 ? MotionType.DANCE_TYPE_1 : MotionType.NONE
      )
    ),
  ];

  return { crews, queueCrewIds };
}

function getNextCounts({
  queueCount,
  listenerCount,
  maxQueueCount,
  maxListenerCount,
}: {
  queueCount: number;
  listenerCount: number;
  maxQueueCount: number;
  maxListenerCount: number;
}) {
  if (queueCount < maxQueueCount) {
    return {
      nextQueueCount: Math.min(queueCount + 1, maxQueueCount),
      nextListenerCount: listenerCount,
    };
  }

  return {
    nextQueueCount: queueCount,
    nextListenerCount: Math.min(listenerCount + 1, maxListenerCount),
  };
}

export default function AvatarStageDebugPage() {
  const { useCurrentPartyroom } = useStores();
  const [config, setConfig] = useState({
    maxQueueCount: 20,
    maxListenerCount: 50,
    autoPlay: true,
    intervalMs: 450,
    startQueue: 1,
    startListeners: 1,
  });
  const [queueCount, setQueueCount] = useState(1);
  const [listenerCount, setListenerCount] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  const { maxQueueCount, maxListenerCount, intervalMs, startQueue, startListeners } = config;

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const nextConfig = {
      maxQueueCount: Number(search.get('queue') ?? '20'),
      maxListenerCount: Number(search.get('listeners') ?? '50'),
      autoPlay: search.get('autoplay') !== 'false',
      intervalMs: Number(search.get('intervalMs') ?? '450'),
      startQueue: Number(search.get('startQueue') ?? '1'),
      startListeners: Number(search.get('startListeners') ?? '1'),
    };

    setConfig(nextConfig);
    setQueueCount(nextConfig.startQueue);
    setListenerCount(nextConfig.startListeners);
    setIsPlaying(nextConfig.autoPlay);
  }, []);

  const applyCounts = (nextQueueCount: number, nextListenerCount: number) => {
    const { crews } = buildCrews(nextQueueCount, nextListenerCount);

    useCurrentPartyroom.getState().init({
      id: 1,
      me: undefined,
      playbackActivated: false,
      crews,
      currentDj: { crewId: 1 },
      notice: '',
    });
  };

  const stepForward = () => {
    const { nextQueueCount, nextListenerCount } = getNextCounts({
      queueCount,
      listenerCount,
      maxQueueCount,
      maxListenerCount,
    });

    setQueueCount(nextQueueCount);
    setListenerCount(nextListenerCount);
    startTransition(() => {
      applyCounts(nextQueueCount, nextListenerCount);
    });

    if (nextQueueCount >= maxQueueCount && nextListenerCount >= maxListenerCount) {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    applyCounts(queueCount, listenerCount);

    return () => {
      useCurrentPartyroom.getState().reset();
    };
  }, [listenerCount, queueCount, useCurrentPartyroom]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      stepForward();
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs, isPlaying, listenerCount, maxListenerCount, maxQueueCount, queueCount]);

  const { queueCrewIds } = buildCrews(queueCount, listenerCount);

  return (
    <main className='bg-partyRoom bg-left-bottom overflow-hidden relative'>
      <div className='absolute top-4 left-4 z-20 rounded bg-black/70 px-4 py-3 text-white text-sm flex flex-col gap-2'>
        <div>{`queue ${queueCount}/${maxQueueCount} | listeners ${listenerCount}/${maxListenerCount}`}</div>
        <div className='flex gap-2'>
          <button
            type='button'
            className='rounded bg-red-700 px-3 py-1'
            onClick={() => setIsPlaying((prev) => !prev)}
          >
            {isPlaying ? 'pause' : 'play'}
          </button>
          <button
            type='button'
            className='rounded bg-gray-700 px-3 py-1'
            onClick={() => {
              setIsPlaying(false);
              setQueueCount(startQueue);
              setListenerCount(startListeners);
              startTransition(() => {
                applyCounts(startQueue, startListeners);
              });
            }}
          >
            reset
          </button>
          <button
            type='button'
            className='rounded bg-gray-700 px-3 py-1'
            onClick={() => {
              setIsPlaying(false);
              stepForward();
            }}
          >
            step
          </button>
        </div>
      </div>
      <PartyroomAvatars
        partyroomId={1}
        enableQueueFetch={false}
        djQueueCrewIdsOverride={queueCrewIds}
      />
    </main>
  );
}
