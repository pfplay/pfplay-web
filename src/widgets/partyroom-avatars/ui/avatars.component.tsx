'use client';
import { Avatar } from '@/entities/avatar';
import { MotionType } from '@/shared/api/http/types/@enums';
import { pick } from '@/shared/lib/functions/pick';
import { useStores } from '@/shared/lib/store/stores.context';
import useAssignAvatarPositions from '../lib/use-assign-avatar-positions.hook';
import { Area } from '../model/avatar-position.model';

export default function Avatars() {
  const { useCurrentPartyroom } = useStores();
  const { crews, currentDj } = useCurrentPartyroom((state) => pick(state, ['crews', 'currentDj']));
  const dj = currentDj && crews.find((crew) => crew.crewId === currentDj.crewId);

  const positionedCrews = useAssignAvatarPositions({
    originCrews: crews,
    allowArea: ALLOW_AREA,
    denyArea: DENY_AREA,
  });

  return (
    /*
     * 파티룸 배경과 같은 aspect ratio, bg-cover, bg-left-bottom, overflow-hidden 를 적용하여,
     * 화면 신축에 상관 없이 배경 이미지 상 항상 같은 위치에 아바타가 위치하도록 함
     */
    <div className='h-screen aspect-partyroom-bg absolute inset-0 z-0 bg-cover bg-left-bottom overflow-hidden'>
      {!!dj && (
        <div
          className='absolute'
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
            key={'partyroom-crew-' + crew.uid}
            className='absolute'
            style={{
              top: `${crew.position.y}%`,
              left: `${crew.position.x}%`,
              transform: 'translate(-100%, -100%)',
            }}
          >
            <Avatar
              height={180}
              bodyUri={crew.avatarBodyUri}
              faceUri={crew.avatarFaceUri}
              facePosX={crew.combinePositionX}
              facePosY={crew.combinePositionY}
              dance={crew.motionType !== MotionType.NONE}
            />
          </div>
        );
      })}
    </div>
  );
}

const ALLOW_AREA: Area = {
  from: { x: 10, y: 60 },
  to: { x: 80, y: 100 },
};

const DENY_AREA: Area = {
  from: { x: 0, y: 0 },
  to: { x: 40, y: 100 },
};
