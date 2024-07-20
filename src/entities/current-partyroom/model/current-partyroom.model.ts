import type { Next } from '@/shared/lib/functions/update';
import * as Dj from './dj.model';

export type CurrentDjing = {
  dj: Dj.Model;
  music: {
    title: string;
    duration: number;
  };
};

export type Djing = {
  current?: CurrentDjing;
  queue?: Dj.Model[];
  locked: boolean;
};

export type CurrentPartyroom = {
  djing: Djing;
  setDjing: (next: Next<Djing>) => void;
  resetDjing: () => void;
};
