import { getSchema } from './form.model';

const mockDictionary = {
  common: {
    ec: {
      char_field_required: '필수 입력입니다',
      char_limit_30: '30자 이내로 입력해주세요',
      char_limit_50: '50자 이내로 입력해주세요',
    },
  },
  createparty: {
    para: {
      noti_djing_limit: '최소 3명 이상이어야 합니다',
    },
  },
} as any;

const schema = getSchema(mockDictionary);

const validBase = {
  name: '파티룸',
  introduce: '소개글입니다',
  limit: 10,
};

describe('partyroom form schema', () => {
  describe('name 필드', () => {
    it.each(['한글', 'Test', '123', '한Test123'])('유효: "%s"', (name) => {
      expect(schema.safeParse({ ...validBase, name }).success).toBe(true);
    });

    test('경계값: 1자', () => {
      expect(schema.safeParse({ ...validBase, name: '가' }).success).toBe(true);
    });

    test('경계값: 30자', () => {
      expect(schema.safeParse({ ...validBase, name: '가'.repeat(30) }).success).toBe(true);
    });

    test('무효: 빈 문자열', () => {
      expect(schema.safeParse({ ...validBase, name: '' }).success).toBe(false);
    });

    test('무효: 31자 초과', () => {
      expect(schema.safeParse({ ...validBase, name: '가'.repeat(31) }).success).toBe(false);
    });

    it.each(['파티$', 'Test Room', '파티!@#'])('무효: 특수문자/공백 "%s"', (name) => {
      expect(schema.safeParse({ ...validBase, name }).success).toBe(false);
    });
  });

  describe('introduce 필드', () => {
    test('유효: 일반 텍스트', () => {
      expect(schema.safeParse({ ...validBase, introduce: '안녕하세요' }).success).toBe(true);
    });

    test('경계값: 1자', () => {
      expect(schema.safeParse({ ...validBase, introduce: '가' }).success).toBe(true);
    });

    test('경계값: 50자', () => {
      expect(schema.safeParse({ ...validBase, introduce: '가'.repeat(50) }).success).toBe(true);
    });

    test('무효: 빈 문자열', () => {
      expect(schema.safeParse({ ...validBase, introduce: '' }).success).toBe(false);
    });

    test('무효: 51자 초과', () => {
      expect(schema.safeParse({ ...validBase, introduce: '가'.repeat(51) }).success).toBe(false);
    });
  });

  describe('domain 필드', () => {
    test('유효: undefined', () => {
      expect(schema.safeParse({ ...validBase, domain: undefined }).success).toBe(true);
    });

    it.each(['example', 'sub.domain'])('유효: "%s"', (domain) => {
      expect(schema.safeParse({ ...validBase, domain }).success).toBe(true);
    });

    test('무효: 공백 포함', () => {
      expect(schema.safeParse({ ...validBase, domain: 'my domain' }).success).toBe(false);
    });
  });

  describe('limit 필드', () => {
    it.each([3, 100])('유효: %d', (limit) => {
      expect(schema.safeParse({ ...validBase, limit }).success).toBe(true);
    });

    test('무효: 최소값 미만 (2)', () => {
      expect(schema.safeParse({ ...validBase, limit: 2 }).success).toBe(false);
    });

    test('무효: 음수', () => {
      expect(schema.safeParse({ ...validBase, limit: -5 }).success).toBe(false);
    });
  });
});
