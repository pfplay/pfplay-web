'use client';
import { Avatar } from '@/entities/avatar';
import { Crew } from '@/entities/current-partyroom';
import { MotionType } from '@/shared/api/http/types/@enums';
import { pick } from '@/shared/lib/functions/pick';
import { useStores } from '@/shared/lib/store/stores.context';
import { useAvatarCluster } from '../lib/use-avatar-cluster.hook';

export default function Avatars() {
  const { useCurrentPartyroom } = useStores();
  const { crews, currentDj } = useCurrentPartyroom((state) => pick(state, ['crews', 'currentDj']));

  const dj = currentDj && crews.find((crew: Crew.Model) => crew.crewId === currentDj.crewId);

  const positionedCrews = useAvatarCluster({
    crews: crews,
  });

  return (
    /*
     * 파티룸 배경과 같은 aspect ratio, bg-cover, bg-left-bottom, overflow-hidden 를 적용하여,
     * 화면 신축에 상관 없이 배경 이미지 상 항상 같은 위치에 아바타가 위치하도록 함
     */
    <div className='h-screen aspect-partyroom-bg absolute inset-0 z-0 bg-cover bg-left-bottom overflow-hidden'>
      {!!dj && (
        <div
          className='relative'
          style={{
            top: '98%',
            left: '16%',
            transform: 'translate(-100%, -100%)',
          }}
        >
          <Avatar
            height={380}
            bodyUri={dj.avatarBodyUri}
            faceUri={dj.avatarFaceUri}
            facePosX={dj.combinePositionX}
            facePosY={dj.combinePositionY}
            reaction={dj.reactionType}
            dance
          />
        </div>
      )}

      {positionedCrews.map((crew) => {
        const isDj = dj?.crewId === crew.crewId;
        if (isDj) {
          return null;
        }

        return (
          <div
            key={'partyroom-crew-' + crew.crewId}
            className='absolute'
            style={{
              top: `${crew.position.y}px`,
              left: `${crew.position.x}px`,
              transform: 'translate(-100%, -100%)',
            }}
          >
            <Avatar
              height={180}
              bodyUri={crew.avatarBodyUri}
              faceUri={crew.avatarFaceUri}
              facePosX={crew.combinePositionX}
              facePosY={crew.combinePositionY}
              reaction={crew.reactionType}
              dance={crew.motionType !== MotionType.NONE}
            />
          </div>
        );
      })}
    </div>
  );
}
