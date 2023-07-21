import { Poppins, Nanum_Gothic } from 'next/font/google';

export const fontNanumGothic = Nanum_Gothic({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '700'],
});

// Check if fontPoppins is used
export const fontPoppins = Poppins({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

