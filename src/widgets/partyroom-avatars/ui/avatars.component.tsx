'use client';
import { useParams } from 'next/navigation';
import { Avatar } from '@/entities/avatar';
import { BASE_SCALE, BASE_X, BASE_Y } from '@/entities/avatar/config/base-size';
import { useAvatarDance } from '@/entities/avatar/ui/useAvatarDance.hook';
import { Crew } from '@/entities/current-partyroom';
import { useFetchDjingQueue } from '@/features/partyroom/list-djing-queue';
import { pick } from '@/shared/lib/functions/pick';
import { useStores } from '@/shared/lib/store/stores.context';
import { useAvatarCluster } from '../lib/use-avatar-cluster.hook';
import { AVATAR_GROUP } from '../model/constants';

export default function Avatars() {
  const { useCurrentPartyroom } = useStores();
  const { crews, currentDj } = useCurrentPartyroom((state) => pick(state, ['crews', 'currentDj']));
  const params = useParams<{ id: string }>();
  const { data: djingQueue } = useFetchDjingQueue({ partyroomId: Number(params.id) }, true);

  const currentDjFromQueue = djingQueue?.djs
    .slice()
    .sort((a, b) => a.orderNumber - b.orderNumber)[0];
  const currentDjCrewId = currentDjFromQueue?.crewId ?? currentDj?.crewId;
  const dj = currentDjCrewId
    ? crews.find((crew: Crew.Model) => crew.crewId === currentDjCrewId)
    : undefined;
  const djQueueCrewIds = djingQueue
    ? djingQueue.djs
        .filter((dj) => dj.crewId !== currentDjCrewId && dj.orderNumber > 1)
        .map((dj) => dj.crewId)
    : [];

  const { registerAvatar } = useAvatarDance();

  const { courtPositions, queuePositions } = useAvatarCluster({
    crews: crews,
    djQueueCrewIds: djQueueCrewIds,
  });

  const crewMap = new Map(crews.map((c) => [c.crewId, c]));
  const positionedCrews = courtPositions
    .map((pos) => ({ crew: crewMap.get(pos.crewId), position: pos.position }))
    .filter((item): item is { crew: Crew.Model; position: typeof item.position } => !!item.crew);
  const djQueueCrews = queuePositions
    .map((pos) => ({ crew: crewMap.get(pos.crewId), position: pos.position }))
    .filter((item): item is { crew: Crew.Model; position: typeof item.position } => !!item.crew);

  return (
    /*
     * 파티룸 배경과 같은 aspect ratio, bg-cover, bg-left-bottom, overflow-hidden 를 적용하여,
     * 화면 신축에 상관 없이 배경 이미지 상 항상 같은 위치에 아바타가 위치하도록 함
     */
    <div className='h-screen aspect-partyroom-bg absolute inset-0 z-0 bg-cover bg-left-bottom overflow-hidden'>
      {!!dj && (
        <div
          data-testid='partyroom-current-dj'
          className='relative'
          style={{
            top: '98%',
            left: '16%',
            transform: 'translate(-10%, -100%)',
          }}
        >
          <Avatar
            height={380}
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
      {djQueueCrews.map(({ crew, position }, index) => (
        <div
          key={'partyroom-dj-queue-' + crew.crewId + index}
          className='absolute'
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
            transform: 'translate(-50%, -100%)',
          }}
          data-testid='partyroom-dj-queue-item'
        >
          <Avatar
            height={AVATAR_GROUP.HEIGHT}
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
      {positionedCrews.map(({ crew, position }, index) => {
        if (dj?.crewId === crew.crewId) return null;

        return (
          <div
            key={'partyroom-crew-' + crew.crewId + index}
            className='absolute'
            style={{
              top: `${position.y}px`,
              left: `${position.x}px`,
              transform: 'translate(-100%, -100%)',
            }}
          >
            <Avatar
              height={AVATAR_GROUP.HEIGHT}
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
