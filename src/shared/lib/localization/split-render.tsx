import { Fragment } from 'react';

/**
 * \n이 포함된 문자를 렌더할 때 사용합니다.
 */
export const renderBr = (text: string) => {
  return text.split('\n').map((line, index, { length }) => {
    return (
      <Fragment key={`${text}_${line}_${index}`}>
        {line}
        {index + 1 < length && <br />}
      </Fragment>
    );
  });
};

export const renderLi = (text: string) => {
  return text.split('\n').map((line, index) => {
    return <li key={`${text}_${line}_${index}`}>{line}</li>;
  });
};

export const replaceVar = (text: string, vars: Record<string, string | number>) => {
  return Object.entries(vars).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`{${key}}`, 'g'), value.toString());
  }, text);
};
