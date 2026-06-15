'use client';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/entities/avatar';
import { BASE_SCALE, BASE_X, BASE_Y } from '@/entities/avatar/config/base-size';
import { useAvatarDance } from '@/entities/avatar/ui/useAvatarDance.hook';
import { Crew } from '@/entities/current-partyroom';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { pick } from '@/shared/lib/functions/pick';
import { useStores } from '@/shared/lib/store/stores.context';
import MailBounceSignal from './mail-bounce-signal.component';
import { calculateStageImageFrame } from '../lib/calculate-stage-image-frame';
import { useAvatarCluster } from '../lib/use-avatar-cluster.hook';
import { AVATAR_GROUP, AVATAR_QUEUE, DJ_AVATAR, PARTYROOM_BACKGROUND } from '../model/constants';

type Props = {
  partyroomId?: number;
  enableQueueFetch?: boolean;
  djQueueCrewIdsOverride?: number[];
};

export default function Avatars({
  partyroomId,
  enableQueueFetch = true,
  djQueueCrewIdsOverride,
}: Props) {
  const { useCurrentPartyroom } = useStores();
  const { crews, currentDj, chatSignals } = useCurrentPartyroom((state) =>
    pick(state, ['crews', 'currentDj', 'chatSignals'])
  );
  const params = useParams<{ id: string }>();
  const resolvedPartyroomId = partyroomId ?? Number(params.id);
  const { data: djingQueue } = useFetchDjingQueue(
    { partyroomId: resolvedPartyroomId },
    enableQueueFetch && Number.isFinite(resolvedPartyroomId)
  );

  const currentDjFromQueue = djingQueue?.djs
    .slice()
    .sort((a, b) => a.orderNumber - b.orderNumber)[0];
  const currentDjCrewId = currentDjFromQueue?.crewId ?? currentDj?.crewId;
  const dj = currentDjCrewId
    ? crews.find((crew: Crew.Model) => crew.crewId === currentDjCrewId)
    : undefined;
  const djQueueCrewIds = (
    djQueueCrewIdsOverride ??
    (djingQueue
      ? djingQueue.djs
          .slice()
          .sort((a, b) => a.orderNumber - b.orderNumber)
          .filter((dj) => dj.crewId !== currentDjCrewId && dj.orderNumber > 1)
          .map((dj) => dj.crewId)
      : [])
  ).slice(0, 5);

  const { registerAvatar } = useAvatarDance();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageBounds, setStageBounds] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = stageRef.current;
    if (!element) {
      return;
    }

    const updateStageBounds = () => {
      setStageBounds({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateStageBounds();

    const observer = new ResizeObserver(() => {
      updateStageBounds();
    });

    observer.observe(element);
    window.addEventListener('resize', updateStageBounds);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateStageBounds);
    };
  }, []);

  const stageImageFrame = calculateStageImageFrame(stageBounds);
  const avatarStageBounds = {
    width: stageImageFrame.width,
    height: stageImageFrame.height,
  };
  const stageScale =
    stageImageFrame.height > 0 ? stageImageFrame.height / PARTYROOM_BACKGROUND.HEIGHT : 0;
  const clusterAvatarHeight = AVATAR_GROUP.HEIGHT * stageScale;
  const queueAvatarHeight = AVATAR_QUEUE.HEIGHT * stageScale;
  const djAvatarHeight = DJ_AVATAR.HEIGHT * stageScale;

  const { courtPositions, queuePositions } = useAvatarCluster({
    crews: crews,
    djQueueCrewIds: djQueueCrewIds,
    stageBounds: avatarStageBounds,
  });

  const crewMap = new Map(crews.map((c) => [c.crewId, c]));
  const positionedCrews = courtPositions
    .map((pos) => ({ crew: crewMap.get(pos.crewId), position: pos.position }))
    .filter((item): item is { crew: Crew.Model; position: typeof item.position } => !!item.crew);
  const djQueueCrews = queuePositions
    .map((pos) => ({ crew: crewMap.get(pos.crewId), position: pos.position }))
    .filter((item): item is { crew: Crew.Model; position: typeof item.position } => !!item.crew);

  return (
    <div ref={stageRef} className='absolute inset-0 z-0 overflow-hidden'>
      {!!dj && (
        <div
          data-testid='partyroom-current-dj'
          data-crew-id={String(dj.crewId)}
          data-avatar-body-uri={dj.avatarBodyUri}
          data-reaction-type={dj.reactionType ?? ''}
          className='absolute'
          style={{
            top: `${stageImageFrame.offsetY + stageImageFrame.height * DJ_AVATAR.ANCHOR_Y_RATIO}px`,
            left: `${stageImageFrame.offsetX + stageImageFrame.width * DJ_AVATAR.ANCHOR_X_RATIO}px`,
            transform: DJ_AVATAR.TRANSLATE,
          }}
        >
          <MailBounceSignal signalKey={chatSignals[dj.crewId]} />
          <Avatar
            height={djAvatarHeight}
            bodyUri={dj.avatarBodyUri}
            compositionType={dj.avatarCompositionType}
            faceUri={dj.avatarFaceUri}
            facePosX={dj.combinePositionX}
            facePosY={dj.combinePositionY}
            reaction={dj.reactionType}
            motionType={dj.motionType}
            offsetX={dj.offsetX || BASE_X}
            offsetY={dj.offsetY || BASE_Y}
            scale={dj.scale || BASE_SCALE}
            avatarRef={registerAvatar}
          />
        </div>
      )}

      {/* DJ Queue Avatars  */}
      {djQueueCrews.map(({ crew, position }) => (
        <div
          key={'partyroom-dj-queue-' + crew.crewId}
          className='absolute'
          data-crew-id={String(crew.crewId)}
          data-avatar-body-uri={crew.avatarBodyUri}
          data-reaction-type={crew.reactionType ?? ''}
          style={{
            top: `${stageImageFrame.offsetY + position.y}px`,
            left: `${stageImageFrame.offsetX + position.x}px`,
            transform: 'translate(-50%, -100%)',
          }}
          data-testid='partyroom-dj-queue-item'
        >
          <MailBounceSignal signalKey={chatSignals[crew.crewId]} />
          <Avatar
            height={queueAvatarHeight}
            bodyUri={crew.avatarBodyUri}
            compositionType={crew.avatarCompositionType}
            faceUri={crew.avatarFaceUri}
            facePosX={crew.combinePositionX}
            facePosY={crew.combinePositionY}
            reaction={crew.reactionType}
            offsetX={crew.offsetX || BASE_X}
            offsetY={crew.offsetY || BASE_Y}
            scale={crew.scale || BASE_SCALE}
            motionType={crew.motionType}
            avatarRef={registerAvatar}
          />
        </div>
      ))}

      {/* Cluster Avatars */}
      {positionedCrews.map(({ crew, position }) => {
        if (dj?.crewId === crew.crewId) return null;

        return (
          <div
            key={'partyroom-crew-' + crew.crewId}
            className='absolute'
            data-testid='partyroom-crew-item'
            data-crew-id={String(crew.crewId)}
            data-avatar-body-uri={crew.avatarBodyUri}
            data-reaction-type={crew.reactionType ?? ''}
            style={{
              top: `${stageImageFrame.offsetY + position.y}px`,
              left: `${stageImageFrame.offsetX + position.x}px`,
              transform: 'translate(-100%, -100%)',
            }}
          >
            <MailBounceSignal signalKey={chatSignals[crew.crewId]} />
            <Avatar
              height={clusterAvatarHeight}
              bodyUri={crew.avatarBodyUri}
              compositionType={crew.avatarCompositionType}
              faceUri={crew.avatarFaceUri}
              facePosX={crew.combinePositionX}
              facePosY={crew.combinePositionY}
              reaction={crew.reactionType}
              offsetX={crew.offsetX || BASE_X}
              offsetY={crew.offsetY || BASE_Y}
              scale={crew.scale || BASE_SCALE}
              motionType={crew.motionType}
              avatarRef={registerAvatar}
            />
          </div>
        );
      })}
    </div>
  );
}
