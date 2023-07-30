import Image from 'next/image';
import { cn } from '@/lib/utils';

export type AvatarBodyImg = {
  id: number;
  type: 'basic' | 'dj' | 'room' | 'ref';
  name: string;
  image: string;
  point: number;
};

//  TODO: 아바타 이미지 데이터 가져오면 mock arr 지우기
export const avatarBodyMockArr: Array<AvatarBodyImg> = [
  {
    id: 1,
    type: 'basic',
    name: '도깨비불',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 0,
  },
  {
    id: 2,
    type: 'basic',
    name: '유령',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 0,
  },
  {
    id: 3,
    type: 'basic',
    name: '기본1',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 0,
  },
  {
    id: 4,
    type: 'dj',
    name: '디제잉 아바타1',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 1,
  },
  {
    id: 5,
    type: 'dj',
    name: '디제잉 아바타2',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 5,
  },
  {
    id: 6,
    type: 'dj',
    name: '디제잉 아바타3',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 10,
  },
  {
    id: 7,
    type: 'dj',
    name: '디제잉 아바타4',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 100,
  },
  {
    id: 8,
    type: 'dj',
    name: '디제잉 아바타5',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 300,
  },
  {
    id: 9,
    type: 'dj',
    name: '디제잉 아바타6',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 600,
  },
  {
    id: 10,
    type: 'dj',
    name: '디제잉 아바타7',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 1000,
  },
  {
    id: 11,
    type: 'dj',
    name: '디제잉 아바타8',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 3000,
  },
  {
    id: 12,
    type: 'dj',
    name: '디제잉 아바타9',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 5000,
  },
  {
    id: 13,
    type: 'dj',
    name: '디제잉 아바타10',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 10000,
  },
  {
    id: 14,
    type: 'dj',
    name: '디제잉 아바타11',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 20000,
  },
  {
    id: 15,
    type: 'dj',
    name: '디제잉 아바타12',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 30000,
  },
  {
    id: 16,
    type: 'ref',
    name: '레퍼럴 아바타1',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 1,
  },
  {
    id: 17,
    type: 'ref',
    name: '레퍼럴 아바타2',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 5,
  },
  {
    id: 18,
    type: 'ref',
    name: '레퍼럴 아바타3',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 10,
  },
  {
    id: 19,
    type: 'ref',
    name: '레퍼럴 아바타4',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 100,
  },
  {
    id: 20,
    type: 'room',
    name: '누적 DJ 아바타1',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 1,
  },
  {
    id: 21,
    type: 'room',
    name: '누적 DJ 아바타2',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 5,
  },
  {
    id: 22,
    type: 'room',
    name: '누적 DJ 아바타3',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 10,
  },
  {
    id: 23,
    type: 'room',
    name: '누적 DJ 아바타4',
    image:
      'https://postfiles.pstatic.net/MjAyMzA3MjlfMTE3/MDAxNjkwNjE0MTc3MjUz.owpzAVyLyeWQNKejvnYsd7g4Qv9SPvwwzl6voUCAeZ0g.Re2hKthxs8iV4NJr2Ofd-4_DfiXe46GzvPfhrjftX3Eg.PNG.sylviuss/avatar_empty.png?type=w773',
    point: 100,
  },
];

interface AvatarBodyProps {
  selectedBody: AvatarBodyImg;
  setSelectedBody: (body: AvatarBodyImg) => void;
}

const AvatarBody = ({ selectedBody, setSelectedBody }: AvatarBodyProps) => {
  return (
    <>
      <div className='max-h-[400px] grid grid-cols-5 gap-5 mt-7 scrollbar-hide overflow-y-auto'>
        {/* //  TODO: 아바타 이미지 데이터 가져오면 mock arr 대체하기 */}
        {avatarBodyMockArr.map((avatar) => (
          <div className='relative w-full max-width-[200px] aspect-square'>
            {/* // TODO: Component화 시키고 반응형으로 만들기 */}
            <Image
              key={avatar.id}
              src={avatar.image}
              alt={avatar.name}
              fill
              sizes='(max-width:200px) 100vw, 200px'
              onClick={() => setSelectedBody({ ...avatar })}
              className={cn(
                'bg-grey-500 max-h-[200px] aspect-square cursor-pointer',
                selectedBody.id === avatar.id && 'border-[1px] border-red-700 bg-white'
              )}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default AvatarBody;
