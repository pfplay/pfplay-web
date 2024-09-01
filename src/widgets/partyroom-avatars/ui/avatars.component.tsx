'use client';
import { useState } from 'react';
import { Avatar } from '@/entities/avatar';
import { Member } from '@/entities/current-partyroom';
import { MotionType } from '@/shared/api/http/types/@enums';
import { pick } from '@/shared/lib/functions/pick';
import useDidUpdateEffect from '@/shared/lib/hooks/use-did-update-effect';
import { useStores } from '@/shared/lib/store/stores.context';
import { Area, getRandomPoint, getRandomPoints, Point } from '../model/avatar-position.model';

export default function Avatars() {
  const { useCurrentPartyroom } = useStores();
  const { members: storedMembers, currentDj } = useCurrentPartyroom((state) =>
    pick(state, ['members', 'currentDj'])
  );
  const [localMembers, setLocalMembers] = useState<Member.Model[]>([]);
  const [randomPoints, setRandomPoints] = useState<Point[]>([]);

  const dj = currentDj && localMembers.find((member) => member.memberId === currentDj.memberId);

  const storedMembersInitialized = !!storedMembers.length;
  const localMembersInitialized = !!localMembers.length && !!randomPoints.length;

  const syncWithStoredMembers = () => {
    setLocalMembers((prevLocalMembers) => {
      const isAdded = prevLocalMembers.length < storedMembers.length;
      const isRemoved = prevLocalMembers.length > storedMembers.length;

      if (isAdded) {
        // 추가된 멤버의 index에 맞춰 randomPoints에 새로운 point 추가
        const prevMemberUidSet = new Set(prevLocalMembers.map((m) => m.uid));
        const newMemberIndex = storedMembers.findIndex(
          (member) => !prevMemberUidSet.has(member.uid)
        );
        const newPoint = getRandomPoint(ALLOW_AREA, DENY_AREA);
        setRandomPoints((prev) => {
          const next = [...prev];
          next.splice(newMemberIndex, 0, newPoint);
          return next;
        });
      }

      if (isRemoved) {
        // 삭제된 멤버의 index에 맞춰 randomPoints에서 point 제거
        const changedMemberUidSet = new Set(storedMembers.map((m) => m.uid));
        const removedMemberIndex = prevLocalMembers.findIndex(
          (member) => !changedMemberUidSet.has(member.uid)
        );
        setRandomPoints((prev) => {
          const next = [...prev];
          next.splice(removedMemberIndex, 1);
          return next;
        });
      }

      return storedMembers;
    });
  };

  useDidUpdateEffect(() => {
    // 파티룸 진입 시 조건문이 순차로 실행된 후, 이후부턴 storedMembers가 변경될 때마다 syncWithStoredMembers가 실행됨
    if (!storedMembersInitialized) {
      return;
    }

    if (!localMembersInitialized) {
      setLocalMembers(storedMembers);
      setRandomPoints(getRandomPoints(storedMembers.length, ALLOW_AREA, DENY_AREA));
      return;
    }

    syncWithStoredMembers();
  }, [storedMembersInitialized, localMembersInitialized, storedMembers]);

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

      {localMembers.map((member, index) => {
        if (member.memberId === dj?.memberId) {
          return null;
        }
        if (!randomPoints[index]) {
          /* localMembers와 randomPoints의 length가 동기화 되지 않는 일순간이 있을 수 있음 */
          return null;
        }
        return (
          <div
            key={'partyroom-member-' + member.uid}
            className='absolute'
            style={{
              top: `${randomPoints[index].y}%`,
              left: `${randomPoints[index].x}%`,
              transform: 'translate(-100%, -100%)',
            }}
          >
            <Avatar
              height={180}
              bodyUri={member.avatarBodyUri}
              faceUri={member.avatarFaceUri}
              facePosX={member.combinePositionX}
              facePosY={member.combinePositionY}
              dance={member.motionType !== MotionType.NONE}
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
