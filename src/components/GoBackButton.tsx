import React from 'react';
import Icons from './Icons';

interface GoBackButtonProps extends React.ComponentProps<'button'> {
  text: string;
}

const GoBackButton = ({ text, ...props }: GoBackButtonProps) => {
  return (
    <button className='text-2xl flex items-center mb-8 w-full text-white' {...props}>
      <Icons.arrowLeft />
      {text}
    </button>
  );
};
export default GoBackButton;
