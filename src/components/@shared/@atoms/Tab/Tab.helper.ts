import { cn } from '@/lib/utils';

export const getCommentTabStyle = (selected: boolean) => {
  return cn(
    'flexRowCenter gap-[6px] outline-none border-b-[1px] border-gray-400',
    selected && 'text-red-300 border-red-300'
  );
};
