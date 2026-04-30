import { ReactionType, StageType } from '@/shared/api/http/types/@enums';

import type { ReactionTypeLabel, StageTypeLabel } from './events';

export function reactionTypeLabel(type: ReactionType): ReactionTypeLabel {
  switch (type) {
    case ReactionType.LIKE:
      return 'like';
    case ReactionType.DISLIKE:
      return 'dislike';
    case ReactionType.GRAB:
      return 'grab';
  }
}

export function stageTypeLabel(type: StageType): StageTypeLabel {
  return type === StageType.MAIN ? 'main' : 'general';
}
