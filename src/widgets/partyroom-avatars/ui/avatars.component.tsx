'use client';
import { useState } from 'react';
import { Avatar } from '@/entities/avatar';
import { Crew } from '@/entities/current-partyroom';
import { MotionType } from '@/shared/api/http/types/@enums';
import { pick } from '@/shared/lib/functions/pick';
import useDidUpdateEffect from '@/shared/lib/hooks/use-did-update-effect';
import { useStores } from '@/shared/lib/store/stores.context';
import { Area, getRandomPoint, getRandomPoints, Point } from '../model/avatar-position.model';

export default function Avatars() {
  const { useCurrentPartyroom } = useStores();
  const { crews: storedCrews, currentDj } = useCurrentPartyroom((state) =>
    pick(state, ['crews', 'currentDj'])
  );
  const [localCrews, setLocalCrews] = useState<Crew.Model[]>([]);
  const [randomPoints, setRandomPoints] = useState<Point[]>([]);

  const dj = currentDj && localCrews.find((crew) => crew.crewId === currentDj.crewId);

  const storedCrewsInitialized = !!storedCrews.length;
  const localCrewsInitialized = !!localCrews.length && !!randomPoints.length;

  const syncWithStoredCrews = () => {
    setLocalCrews((prevLocalCrews) => {
      const isAdded = prevLocalCrews.length < storedCrews.length;
      const isRemoved = prevLocalCrews.length > storedCrews.length;

      if (isAdded) {
        // 추가된 멤버의 index에 맞춰 randomPoints에 새로운 point 추가
        const prevCrewUidSet = new Set(prevLocalCrews.map((m) => m.uid));
        const newCrewIndex = storedCrews.findIndex((crew) => !prevCrewUidSet.has(crew.uid));
        const newPoint = getRandomPoint(ALLOW_AREA, DENY_AREA);
        setRandomPoints((prev) => {
          const next = [...prev];
          next.splice(newCrewIndex, 0, newPoint);
          return next;
        });
      }

      if (isRemoved) {
        // 삭제된 멤버의 index에 맞춰 randomPoints에서 point 제거
        const changedCrewUidSet = new Set(storedCrews.map((m) => m.uid));
        const removedCrewIndex = prevLocalCrews.findIndex(
          (crew) => !changedCrewUidSet.has(crew.uid)
        );
        setRandomPoints((prev) => {
          const next = [...prev];
          next.splice(removedCrewIndex, 1);
          return next;
        });
      }

      return storedCrews;
    });
  };

  useDidUpdateEffect(() => {
    // 파티룸 진입 시 조건문이 순차로 실행된 후, 이후부턴 storedCrews가 변경될 때마다 syncWithStoredCrews가 실행됨
    if (!storedCrewsInitialized) {
      return;
    }

    if (!localCrewsInitialized) {
      setLocalCrews(storedCrews);
      setRandomPoints(getRandomPoints(storedCrews.length, ALLOW_AREA, DENY_AREA));
      return;
    }

    syncWithStoredCrews();
  }, [storedCrewsInitialized, localCrewsInitialized, storedCrews]);

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

      {localCrews.map((crew, index) => {
        if (crew.crewId === dj?.crewId) {
          return null;
        }
        if (!randomPoints[index]) {
          /* localCrews와 randomPoints의 length가 동기화 되지 않는 일순간이 있을 수 있음 */
          return null;
        }
        return (
          <div
            key={'partyroom-crew-' + crew.uid}
            className='absolute'
            style={{
              top: `${randomPoints[index].y}%`,
              left: `${randomPoints[index].x}%`,
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
