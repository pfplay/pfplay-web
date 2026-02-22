import BoldProcessor from './bold-processor';

describe('BoldProcessor', () => {
  test('**text**를 <b> 태그로 변환', () => {
    const processor = new BoldProcessor();
    expect(processor.process('**굵게**')).toBe('<b class="text-red-300">굵게</b>');
  });

  test('여러 볼드 텍스트 변환', () => {
    const processor = new BoldProcessor();
    expect(processor.process('**A**와 **B**')).toBe(
      '<b class="text-red-300">A</b>와 <b class="text-red-300">B</b>'
    );
  });

  test('볼드 마크업 없으면 그대로 반환', () => {
    const processor = new BoldProcessor();
    expect(processor.process('일반 텍스트')).toBe('일반 텍스트');
  });

  test('빈 문자열', () => {
    const processor = new BoldProcessor();
    expect(processor.process('')).toBe('');
  });
});
