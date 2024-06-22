import { Fragment } from 'react';

export const renderBr = (text: string) => {
  return text.split('\n').map((line, index, { length }) => {
    return (
      <Fragment key={`${line}_${index}`}>
        {line}
        {index + 1 < length && <br />}
      </Fragment>
    );
  });
};

export const renderLi = (text: string) => {
  return text.split('\n').map((line, index) => {
    return <li key={`${line}_${index}`}>{line}</li>;
  });
};
