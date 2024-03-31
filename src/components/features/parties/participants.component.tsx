import Image from 'next/image';
import { PartyRoomParticipant } from '@/api/types/parties';
import Typography from '@/components/shared/atoms/typography.component';
import { PFPersonFilled } from '@/components/shared/icons';
import { cn } from '@/utils/cn';

interface ParticipantsProps {
  count?: number;
  // 3명까지만 보여줌
  participants?: PartyRoomParticipant[];
}

const Participants = ({ count, participants }: ParticipantsProps) => {
  return (
    <div className='flexRowCenter gap-[45px]'>
      <div className='flexRowCenter gap-[6px]'>
        <PFPersonFilled width={18} height={18} />
        <Typography type='body3' className='text-gray-50'>
          {count ? count : 0}
        </Typography>
      </div>
      <ul className='flexRowCenter gap-2'>
        {participants?.slice(0, 3).map((participant, i) => (
          <li key={i} className='w-6 h-6 rounded-full bg-slate-400'>
            <Image
              priority
              src={participant.faceUrl || '/images/Background/profile.png'}
              alt={participant.nickname || 'party member'}
              width={24}
              height={24}
              className={cn('w-full h-full object-contain select-none')}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Participants;
