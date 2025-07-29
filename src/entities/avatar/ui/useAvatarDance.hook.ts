import { useRef, useEffect } from 'react';
import { MotionType } from '@/shared/api/http/types/@enums';

const SIN_LUT = new Float32Array(360);
for (let i = 0; i < 360; i++) {
  const rad = (i * Math.PI) / 180;
  SIN_LUT[i] = Math.sin(rad);
}
const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
const fastSin = (angle: number) => SIN_LUT[normalizeAngle(Math.floor(angle))];

type AvatarEntry = {
  el: HTMLElement;
  motionType: MotionType;
};

export function useAvatarDance() {
  const avatarEntries = useRef<AvatarEntry[]>([]);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const registerAvatar = (el: HTMLElement | null, motionType: MotionType) => {
    if (el && !avatarEntries.current.find((entry) => entry.el === el)) {
      avatarEntries.current.push({ el, motionType });
    }
  };

  useEffect(() => {
    startTimeRef.current = performance.now();
    const speed = 1;

    const animate = (time: number) => {
      if (!startTimeRef.current) return;
      const t = ((time - startTimeRef.current) / 1000) * speed;

      avatarEntries.current.forEach((entry, index) => {
        const { el, motionType } = entry;
        const offset = index * 36;
        const angle = t * 360 + offset;

        let transform = '';

        if (motionType === MotionType.DANCE_TYPE_1) {
          const bounceY = Math.abs(fastSin(angle)) * 30;
          const wiggleX = fastSin(angle * 1.2) * 10;
          const rotation = fastSin(angle * 1.5) * 3;
          const scale = 1 + bounceY * 0.01 + fastSin(angle * 1.2) * 0.02;
          transform = `translate(${wiggleX}px, ${-bounceY}px) rotate(${rotation}deg) scale(${scale})`;
        }

        if (motionType === MotionType.DANCE_TYPE_2) {
          const basePeriod = 0.4;
          const totalPeriod = basePeriod * 4; // 3 움찔 + 1 점프

          const phase = (t + index * 0.1) % totalPeriod;
          const step = Math.floor(phase / basePeriod); // 0~3
          const localT = (phase % basePeriod) / basePeriod; // 0~1
          const wave = (fastSin(localT * 180) + 1) / 2; // 부드러운 곡선 0→1→0
          const sizeToMinimize = 0.1;
          const jumpHeight = 30;

          let y = 0;
          let s = 1;

          if (step < 3) {
            // 작아졌다 커지는 움찔 모션
            s = 1 - sizeToMinimize * wave;
          } else {
            // 마지막 큰 점프
            y = wave * jumpHeight;
            s = 1 + wave * 0.1;
          }

          transform = `translateY(${-y}px) scale(${s})`;
        }

        el.style.transform = transform;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      avatarEntries.current = [];
    };
  }, []);

  return { registerAvatar };
}
