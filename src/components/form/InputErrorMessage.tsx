import React from 'react';

interface InputErrorMessageProps {
  errorMessage: string;
}

const InputErrorMessage = ({ errorMessage }: InputErrorMessageProps) => {
  return (
    <span className={'text-red-500 text-xs mt-[8px] placeholder:text-[15px]'}>{errorMessage}</span>
  );
};

export default InputErrorMessage;
