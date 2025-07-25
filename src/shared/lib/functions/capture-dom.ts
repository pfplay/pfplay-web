import { RefObject } from 'react';
import html2canvas from 'html2canvas';

/**
 * DOM을 캡쳐해 Blob으로 변환
 */
const captureDOMToBlob = async <T extends HTMLElement>(dom: RefObject<T>): Promise<Blob> => {
  if (!dom.current) throw new Error('DOM is not found');

  await replaceBackgroundImagesToBase64(dom.current);

  const canvas = await html2canvas(dom.current, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    scale: 0.5,
    width: 300,
    height: 300,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob from canvas'));
      }
    }, 'image/webp');
  });
};

/**
 * DOM 내 background-image를 base64로 치환
 */
const replaceBackgroundImagesToBase64 = async (element: HTMLElement) => {
  const nodesWithBg = element.querySelectorAll<HTMLElement>('*');

  await Promise.all(
    Array.from(nodesWithBg).map(async (node) => {
      const url = extractBackgroundUrl(node.style);
      if (url && url.startsWith('http')) {
        try {
          const base64 = await toBase64(url);
          node.style.backgroundImage = `url(${base64})`;
        } catch (err) {
          console.warn(`⚠️ base64 변환 실패: ${url}`, err);
        }
      }
    })
  );
};

/**
 * background-image 스타일 속성에서 이미지 URL 추출
 */
const extractBackgroundUrl = (style: CSSStyleDeclaration): string | null => {
  const backgroundImage = style.backgroundImage;
  const match = backgroundImage?.match(/url\("?(.+?)"?\)/);
  return match ? match[1] : null;
};

/**
 * 이미지 URL을 base64로 변환
 */
const toBase64 = async (url: string): Promise<string> => {
  // const TEST_URL = 'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?w=300';
  const res = await fetch(url, { mode: 'cors' });
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

/**
 * Blob → FormData 변환
 */
const convertToFormData = (blob: Blob) => {
  const formData = new FormData();
  formData.append('image', blob);
  return formData;
};

export { captureDOMToBlob, convertToFormData };
