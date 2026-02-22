import { captureDOMToBlob, convertToFormData } from './capture-dom';

jest.mock('html2canvas', () =>
  jest.fn().mockResolvedValue({
    toBlob: (cb: (blob: Blob | null) => void) => {
      cb(new Blob(['test'], { type: 'image/webp' }));
    },
  })
);

describe('capture-dom', () => {
  describe('captureDOMToBlob', () => {
    test('DOM이 없으면 에러 throw', async () => {
      const ref = { current: null };
      await expect(captureDOMToBlob(ref)).rejects.toThrow('DOM is not found');
    });

    test('DOM을 캡처하여 Blob 반환', async () => {
      const mockElement = document.createElement('div');
      jest
        .spyOn(mockElement, 'querySelectorAll')
        .mockReturnValue([] as unknown as NodeListOf<HTMLElement>);
      const ref = { current: mockElement };

      const blob = await captureDOMToBlob(ref);

      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('convertToFormData', () => {
    test('Blob을 FormData로 변환', () => {
      const blob = new Blob(['test'], { type: 'image/webp' });
      const formData = convertToFormData(blob);

      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get('image')).toBeInstanceOf(Blob);
    });
  });
});
