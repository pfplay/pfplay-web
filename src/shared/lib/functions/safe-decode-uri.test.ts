// uriDecoder.test.ts

import { safeDecodeURI } from './safe-decode-uri';

describe('safeDecodeURI', () => {
  test('유효한 인코딩된 URI를 디코딩해야 합니다', () => {
    const encodedURI = 'https://example.com/path%20to%20resource';
    const decodedURI = safeDecodeURI(encodedURI);
    expect(decodedURI).toBe('https://example.com/path to resource');
  });

  test('잘못된 URI를 처리하고 가능한 한 많이 디코딩해야 합니다', () => {
    const encodedURI = 'https://example.com/path%2Fto%2resource%';
    const decodedURI = safeDecodeURI(encodedURI);
    expect(decodedURI).toBe('https://example.com/path/to%2resource%');
  });

  test('잘못된 퍼센트 인코딩된 시퀀스를 그대로 두어야 합니다', () => {
    const encodedURI = 'https://example.com/%E0%A4%A';
    const decodedURI = safeDecodeURI(encodedURI);
    expect(decodedURI).toBe('https://example.com/%E0%A4%A');
  });

  test('유효한 시퀀스와 잘못된 퍼센트 인코딩된 시퀀스를 혼합해서 디코딩해야 합니다', () => {
    const encodedURI = 'https://example.com/%E0%A4%A%20valid%20sequence';
    const decodedURI = safeDecodeURI(encodedURI);
    expect(decodedURI).toBe('https://example.com/%E0%A4%A valid sequence');
  });

  test('URIError가 아닌 예외가 발생 시 넣었던 uri를 그대로 return해야한다.', () => {
    const encodedURI = 'https://example.com/%E0%A4%A%20valid%20sequence';

    // decodeURI를 모킹하여 URIError가 아닌 예외를 던지게 함
    jest.spyOn(global, 'decodeURI').mockImplementation(() => {
      throw new Error('Non-URIError exception');
    });

    const decodedURI = safeDecodeURI(encodedURI);

    expect(decodedURI).toBe(encodedURI);
  });
});
