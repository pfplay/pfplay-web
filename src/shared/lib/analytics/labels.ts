import { ReactionType, StageType } from '@/shared/api/http/types/@enums';

import type { ReactionTypeLabel, StageTypeLabel } from './events';

const REACTION_TYPE_LABELS = {
  [ReactionType.LIKE]: 'like',
  [ReactionType.DISLIKE]: 'dislike',
  [ReactionType.GRAB]: 'grab',
} as const satisfies Record<ReactionType, ReactionTypeLabel>;

export function reactionTypeLabel(type: ReactionType): ReactionTypeLabel {
  return REACTION_TYPE_LABELS[type];
}

export function stageTypeLabel(type: StageType): StageTypeLabel {
  return type === StageType.MAIN ? 'main' : 'general';
}
