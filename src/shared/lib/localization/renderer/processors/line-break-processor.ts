import { Singleton } from '@/shared/lib/decorators/singleton';
import type { I18nProcessor } from './_interface';

@Singleton
export default class LineBreakProcessor implements I18nProcessor {
  public process(t: string): string {
    return t.split('\n').join('<br />');
  }
}
