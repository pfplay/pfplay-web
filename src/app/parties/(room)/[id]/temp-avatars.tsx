'use client';
import { useEffect, useState } from 'react';
import { Avatar } from '@/entities/avatar';
import { useFetchMe } from '@/entities/me';
import { useFetchAvatarBodies } from '@/features/edit-profile-avatar/api/use-fetch-avatar-bodies.query';
import { useFetchAvatarFaces } from '@/features/edit-profile-avatar/api/use-fetch-avatar-faces.query';
import { AvatarBody, AvatarFace } from '@/shared/api/http/types/users';

/**
 * @deprecated Onchain 빌더톤용 임시 아바타들 배치
 */
export default function TempAvatars() {
  const { data: me } = useFetchMe();
  const { data: bodies } = useFetchAvatarBodies();
  const { data: faces } = useFetchAvatarFaces();
  const [fakeAvatars, setFakeAvatars] = useState<FakeAvatar[]>([]);

  useEffect(() => {
    if (!me || !bodies || !faces) return;
    if (fakeAvatars.length > 0) return;

    const avatars = makeFakeAvatars({
      count: 12,
      bodies,
      faces,
      allowArea: { from: { x: 10, y: 50 }, to: { x: 70, y: 100 } },
      denyArea: { from: { x: 10, y: 60 }, to: { x: 36, y: 100 } },
    });

    setFakeAvatars(avatars);
  }, [bodies, faces, me]);

  return (
    <div className='absolute inset-0 z-0 min-w-desktop max-w-[2400px]overflow-hidden'>
      <div
        /* DJ 자리 */
        className='absolute'
        style={{
          top: '98%',
          left: '16%',
          transform: 'translate(-100%, -100%)',
        }}
      >
        {!!me?.avatarBodyUri && (
          <Avatar
            height={380}
            bodyUri={me.avatarBodyUri}
            faceUri={me.avatarFaceUri}
            facePosX={me.combinePositionX}
            facePosY={me.combinePositionY}
          />
        )}
      </div>

      {fakeAvatars.map((avatar, index) => (
        <div
          key={'temp-avatar-' + index}
          className='absolute'
          style={{
            top: `${avatar.point.y}%`,
            left: `${avatar.point.x}%`,
            transform: 'translate(-100%, -100%)',
          }}
        >
          <Avatar
            height={180}
            bodyUri={avatar.body.resourceUri}
            faceUri={avatar.body.combinable ? avatar.face.resourceUri : undefined}
            facePosX={avatar.body.combinePositionX}
            facePosY={avatar.body.combinePositionY}
          />
        </div>
      ))}
    </div>
  );
}

type FakeAvatar = {
  body: AvatarBody;
  face: AvatarFace;
  point: Point;
};
type Point = {
  x: number;
  y: number;
};
type Range = {
  from: Point;
  to: Point;
};

/**
 * 임시 로직인데.. 포지션 대강 구하는 로직은 나중에 랜덤 아바타 배치 때 실사용해도 될 듯?
 */
function makeFakeAvatars({
  count,
  bodies,
  faces,
  allowArea,
  denyArea,
}: {
  count: number;
  bodies: AvatarBody[];
  faces: AvatarFace[];
  allowArea: Range;
  denyArea: Range;
}): FakeAvatar[] {
  const avatars: FakeAvatar[] = [];

  while (avatars.length < count) {
    const body = bodies[getRandomInt(0, bodies.length - 1)];
    const face = faces[getRandomInt(0, faces.length - 1)];
    const x = getRandomInt(allowArea.from.x, allowArea.to.x);
    const y = getRandomInt(allowArea.from.y, allowArea.to.y);

    const point = { x, y };
    if (!isWithin(point, denyArea)) {
      avatars.push({ body, face, point });
    }
  }

  return avatars;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isWithin(point: Point, area: Range): boolean {
  return (
    point.x >= area.from.x && point.x <= area.to.x && point.y >= area.from.y && point.y <= area.to.y
  );
}
