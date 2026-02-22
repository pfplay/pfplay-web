import { getSchema } from './form.model';

const mockDictionary = {
  common: {
    ec: {
      char_field_required: '필수 입력입니다',
      char_limit_12: '12자 이내로 입력해주세요',
      char_limit_50: '50자 이내로 입력해주세요',
    },
  },
} as any;

const schema = getSchema(mockDictionary);

describe('edit-profile-bio form schema', () => {
  describe('nickname 필드', () => {
    it.each(['한글', 'Test', '123', '한Test123'])('유효: "%s"', (nickname) => {
      expect(schema.safeParse({ nickname }).success).toBe(true);
    });

    test('경계값: 1자', () => {
      expect(schema.safeParse({ nickname: '가' }).success).toBe(true);
    });

    test('경계값: 12자', () => {
      expect(schema.safeParse({ nickname: '가'.repeat(12) }).success).toBe(true);
    });

    test('무효: 빈 문자열', () => {
      expect(schema.safeParse({ nickname: '' }).success).toBe(false);
    });

    test('무효: 13자 초과', () => {
      expect(schema.safeParse({ nickname: '가'.repeat(13) }).success).toBe(false);
    });

    it.each(['닉네임$', 'Test Name', '유저!@#'])('무효: 특수문자/공백 "%s"', (nickname) => {
      expect(schema.safeParse({ nickname }).success).toBe(false);
    });
  });

  describe('introduction 필드', () => {
    test('유효: undefined', () => {
      expect(schema.safeParse({ nickname: '테스트' }).success).toBe(true);
    });

    test('유효: 빈 문자열', () => {
      expect(schema.safeParse({ nickname: '테스트', introduction: '' }).success).toBe(true);
    });

    test('유효: 50자 텍스트', () => {
      expect(schema.safeParse({ nickname: '테스트', introduction: '가'.repeat(50) }).success).toBe(
        true
      );
    });

    test('무효: 51자 초과', () => {
      expect(schema.safeParse({ nickname: '테스트', introduction: '가'.repeat(51) }).success).toBe(
        false
      );
    });
  });
});
