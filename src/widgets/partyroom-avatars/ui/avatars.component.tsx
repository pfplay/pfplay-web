'use client';
import { Avatar } from '@/entities/avatar';
import { DEFAULT_FACE_POS } from '@/entities/avatar/ui/react-moveable/moveable-face';
import { useAvatarDance } from '@/entities/avatar/ui/useAvatarDance.hook';
import { Crew } from '@/entities/current-partyroom';
import { pick } from '@/shared/lib/functions/pick';
import { useStores } from '@/shared/lib/store/stores.context';
import { useAvatarCluster } from '../lib/use-avatar-cluster.hook';
import { AVATAR_GROUP } from '../model/constants';

export default function Avatars() {
  const { useCurrentPartyroom } = useStores();
  const { crews, currentDj } = useCurrentPartyroom((state) => pick(state, ['crews', 'currentDj']));
  const dj = currentDj && crews.find((crew: Crew.Model) => crew.crewId === currentDj.crewId);
  const { registerAvatar } = useAvatarDance();

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
            motionType={dj.motionType}
          />
        </div>
      )}

      {positionedCrews.map((crew, index) => {
        const isDj = dj?.crewId === crew.crewId;
        if (isDj) {
          return null;
        }

        return (
          <div
            key={'partyroom-crew-' + crew.crewId + index}
            className='absolute'
            style={{
              top: `${crew.position.y}px`,
              left: `${crew.position.x}px`,
              transform: 'translate(-100%, -100%)',
            }}
          >
            <Avatar
              height={AVATAR_GROUP.HEIGHT}
              bodyUri={crew.avatarBodyUri}
              faceUri={crew.avatarFaceUri}
              facePosX={crew.combinePositionX}
              facePosY={crew.combinePositionY}
              reaction={crew.reactionType}
              facePos={DEFAULT_FACE_POS}
              motionType={crew.motionType}
              avatarRef={registerAvatar}
            />
          </div>
        );
      })}
    </div>
  );
}
