import { getSchema } from './playlist-form.model';

const mockDictionary = {
  common: {
    ec: {
      char_field_required: '필수 입력입니다',
      char_limit_20: '20자 이내로 입력해주세요',
    },
  },
} as any;

const schema = getSchema(mockDictionary);

describe('playlist form schema', () => {
  describe('name 필드', () => {
    test('유효: 일반 텍스트', () => {
      expect(schema.safeParse({ name: '플리이름' }).success).toBe(true);
    });

    test('경계값: 1자', () => {
      expect(schema.safeParse({ name: '가' }).success).toBe(true);
    });

    test('경계값: 20자', () => {
      expect(schema.safeParse({ name: '가'.repeat(20) }).success).toBe(true);
    });

    test('무효: 빈 문자열', () => {
      expect(schema.safeParse({ name: '' }).success).toBe(false);
    });

    test('무효: 21자 초과', () => {
      expect(schema.safeParse({ name: '가'.repeat(21) }).success).toBe(false);
    });
  });
});
