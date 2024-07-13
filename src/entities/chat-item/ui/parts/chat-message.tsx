import { Typography } from '@/shared/ui/components/typography';

interface Props {
  message: string;
}
const ChatMessage = ({ message }: Props) => {
  return (
    <div className='w-full bg-gray-900 p-2 rounded-sm'>
      <Typography type='caption1' className='text-white'>
        {message}
      </Typography>
    </div>
  );
};

export default ChatMessage;
