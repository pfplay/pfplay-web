import Icons from './Icons';

interface GoBackButtonProps {
  title: string;
}

const GoBackButton = ({ title }: GoBackButtonProps) => {
  return (
    <div className='text-2xl flex items-center mb-8 w-full text-white'>
      <Icons.arrowLeft />
      <p>{title}</p>
    </div>
  );
};
export default GoBackButton;
