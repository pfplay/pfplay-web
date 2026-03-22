import VariableProcessor from './variable-processor';

export function processI18nString(text: string, variables: Record<string, string>) {
  const processor = new VariableProcessor(variables);
  return processor.process(text);
}
