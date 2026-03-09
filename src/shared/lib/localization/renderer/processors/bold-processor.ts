import { Singleton } from '@/shared/lib/decorators/singleton';
import type { I18nProcessor } from './_interface';

@Singleton
export default class BoldProcessor implements I18nProcessor {
  public process(t: string): string {
    return t.replace(/\*\*(.*?)\*\*/g, '<b className="text-red-300">$1</b>');
  }
}
