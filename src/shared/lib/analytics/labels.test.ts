import { ReactionType, StageType } from '@/shared/api/http/types/@enums';

import { reactionTypeLabel, stageTypeLabel } from './labels';

describe('label converters', () => {
  describe('reactionTypeLabel', () => {
    test.each([
      [ReactionType.LIKE, 'like'],
      [ReactionType.DISLIKE, 'dislike'],
      [ReactionType.GRAB, 'grab'],
    ] as const)('%s → %s', (input, expected) => {
      expect(reactionTypeLabel(input)).toBe(expected);
    });
  });

  describe('stageTypeLabel', () => {
    test('MAIN → main', () => {
      expect(stageTypeLabel(StageType.MAIN)).toBe('main');
    });

    test('GENERAL → general', () => {
      expect(stageTypeLabel(StageType.GENERAL)).toBe('general');
    });
  });
});
