import { errorLog } from '@/shared/lib/functions/log/logger';
import withDebugger from '@/shared/lib/functions/log/with-debugger';
import { useI18n } from '../i18n.context';
import { __dev__preTranslation } from './__dev__preTranslation';
import type { Leaves } from './leaves';
import parseHtmlToReact from './parse-html-to-react';
import type { I18nProcessor } from './processors/_interface';
import type Dictionary from '../dictionaries/en.json';

type Props = {
  i18nKey: Leaves<typeof Dictionary> | keyof typeof __dev__preTranslation;
  processors: I18nProcessor[];
};

// 명시된 태그 외 다른 태그는 렌더링하지 않고 단순 문자열로 취급합니다.
const RELIABLE_HTML_TAGS = ['b', 'strong', 'i', 'em', 'br'];

export default function Trans({ i18nKey, processors }: Props) {
  const i18n = useI18n();

  const t: string | undefined =
    getNestedValue(i18n, i18nKey, '.') ??
    __dev__preTranslation[i18nKey as keyof typeof __dev__preTranslation];

  if (!t) {
    errorLogger(`[I18nRenderer] Invalid i18n key: ${i18nKey}`);
    return null;
  }

  const processedText = processors.reduce((acc, processor) => processor.process(acc), t);

  return (
    <>
      {parseHtmlToReact(processedText, [], {
        keepBasicHtmlNodesFor: RELIABLE_HTML_TAGS,
      })}
    </>
  );
}

function getNestedValue(obj: Record<string, any>, key: string, delimiter: string): any {
  return key.split(delimiter).reduce((acc, k) => acc?.[k], obj);
}

const logger = withDebugger(0);
const errorLogger = logger(errorLog);
