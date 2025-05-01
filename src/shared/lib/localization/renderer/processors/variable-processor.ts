import type { ReactNode } from 'react';
import type { I18nProcessor } from './_interface';

export default class VariableProcessor implements I18nProcessor {
  public constructor(private variables: Record<string, ReactNode>) {}

  public process(t: string): string {
    return t.replace(/{{(.*?)}}/g, (_, key) => {
      return key in this.variables ? String(this.variables[key]) : '';
    });
  }
}
