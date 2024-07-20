import { Fragment, ReactNode } from 'react';

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

/**
 * 문자열 내의 $1, $2, ... 등의 변수를 치환합니다.
 */
export const replaceVar = (text: string, vars: Record<`$${number}`, ReactNode>) => {
  if (Object.keys(vars).some((key) => !key.startsWith('$'))) {
    throw new Error('Key must start with $');
  }

  const maybeVar = (part: string): part is `$${number}` => part.startsWith('$');

  return (
    <>
      {text.split(/(\$\d+)/).map((part) => {
        if (maybeVar(part)) {
          return vars[part] ?? part;
        }
        return part;
      })}
    </>
  );
};
