'use client';
import { useState } from 'react';
import { Avatar } from '@/entities/avatar';
import { PartyroomMember } from '@/shared/api/http/types/partyrooms';
import useDidUpdateEffect from '@/shared/lib/hooks/use-did-update-effect';
import { useStores } from '@/shared/lib/store/stores.context';

/**
 * FIXME: 추후 현재 파티룸의 DJ 정보를 알 수 있게 되면 수정
 */
const TEMP_DJ_MEMBER_ID = 0;

export default function MemberAvatars() {
  const { useCurrentPartyroom } = useStores();
  const storedMembers = useCurrentPartyroom((state) => state.members);
  const [localMembers, setLocalMembers] = useState<PartyroomMember[]>(storedMembers);
  const dj = localMembers.find((member) => member.memberId === TEMP_DJ_MEMBER_ID);
  const [randomPoints, setRandomPoints] = useState(() =>
    Array.from({ length: localMembers.length }, () =>
      getRandomPoint(MEMBERS_AREA.ALLOW, MEMBERS_AREA.DENY)
    )
  );

  useDidUpdateEffect(() => {
    const isAdded = localMembers.length < storedMembers.length;
    const isRemoved = localMembers.length > storedMembers.length;

    setLocalMembers((prev) => {
      if (isAdded) {
        // 추가된 멤버의 index에 맞춰 randomPoints에 새로운 point 추가
        const prevMemberUidSet = new Set(prev.map((m) => m.uid));
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
        const removedMemberIndex = prev.findIndex((member) => !changedMemberUidSet.has(member.uid));
        setRandomPoints((prev) => {
          const next = [...prev];
          next.splice(removedMemberIndex, 1);
          return next;
        });
      }
      return storedMembers;
    });
  }, [storedMembers]);

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