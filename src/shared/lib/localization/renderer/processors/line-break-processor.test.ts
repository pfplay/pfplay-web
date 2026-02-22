import LineBreakProcessor from './line-break-processor';

describe('LineBreakProcessor', () => {
  test('줄바꿈을 <br /> 태그로 변환', () => {
    const processor = new LineBreakProcessor();
    expect(processor.process('첫째 줄\n둘째 줄')).toBe('첫째 줄<br />둘째 줄');
  });

  test('여러 줄바꿈 변환', () => {
    const processor = new LineBreakProcessor();
    expect(processor.process('A\nB\nC')).toBe('A<br />B<br />C');
  });

  test('줄바꿈 없으면 그대로 반환', () => {
    const processor = new LineBreakProcessor();
    expect(processor.process('한 줄 텍스트')).toBe('한 줄 텍스트');
  });

  test('빈 문자열', () => {
    const processor = new LineBreakProcessor();
    expect(processor.process('')).toBe('');
  });
});
