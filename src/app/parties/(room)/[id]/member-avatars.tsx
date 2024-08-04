'use client';
import { useState } from 'react';
import { Avatar } from '@/entities/avatar';
import { PartyroomMember } from '@/shared/api/http/types/partyrooms';
import { pick } from '@/shared/lib/functions/pick';
import useDidUpdateEffect from '@/shared/lib/hooks/use-did-update-effect';
import { useStores } from '@/shared/lib/store/stores.context';

export default function MemberAvatars() {
  const { useCurrentPartyroom } = useStores();
  const { members: storedMembers, currentDj } = useCurrentPartyroom((state) =>
    pick(state, ['members', 'currentDj'])
  );
  const [localMembers, setLocalMembers] = useState<PartyroomMember[]>([]);
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
        const newPoint = getRandomPoint(MEMBERS_AREA.ALLOW, MEMBERS_AREA.DENY);
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
      setRandomPoints(getRandomPoints(storedMembers.length, MEMBERS_AREA.ALLOW, MEMBERS_AREA.DENY));
      return;
    }

    syncWithStoredMembers();
  }, [storedMembersInitialized, localMembersInitialized, storedMembers]);

  return (
    <div className='absolute inset-0 z-0 min-w-desktop max-w-[2400px] overflow-hidden'>
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
            />
          </div>
        );
      })}
    </div>
  );
}

type Point = {
  x: number;
  y: number;
};
type Range = {
  from: Point;
  to: Point;
};

function getRandomPoints(length: number, allowArea: Range, denyArea: Range): Point[] {
  return Array.from({ length }, () => getRandomPoint(allowArea, denyArea));
}

function getRandomPoint(allowArea: Range, denyArea: Range): Point {
  let point: Point;
  do {
    point = {
      x: getRandomInt(allowArea.from.x, allowArea.to.x),
      y: getRandomInt(allowArea.from.y, allowArea.to.y),
    };
  } while (!isWithin(point, denyArea));

  return point;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isWithin(point: Point, area: Range): boolean {
  return (
    point.x >= area.from.x && point.x <= area.to.x && point.y >= area.from.y && point.y <= area.to.y
  );
}

const MEMBERS_AREA: Record<'ALLOW' | 'DENY', Range> = {
  ALLOW: {
    from: { x: 10, y: 50 },
    to: { x: 70, y: 100 },
  },
  DENY: {
    from: { x: 10, y: 60 },
    to: { x: 36, y: 100 },
  },
};
