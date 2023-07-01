import { Icons } from './icons';

interface GoBackButtonProps {
  title: string;
}

export const GoBackButton = ({ title }: GoBackButtonProps) => {
  return (
    <div className='text-2xl flex items-center mb-8 w-full text-white'>
      <Icons.arrowLeft />
      <p>{title}</p>
    </div>
  );
};
