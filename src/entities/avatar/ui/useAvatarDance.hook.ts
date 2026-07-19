import { useRef, useEffect } from 'react';
import { MotionType } from '@/shared/api/http/types/@enums';
import breathingRhythm, { BreathingRhythm } from '../lib/breathing-rhythm';

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
  breathing: BreathingRhythm;
};

/**
 * 호흡 리듬의 기준값. 아바타를 감싸는 요소의 `data-crew-id` 를 쓴다 —
 * 사람마다 고유하고 세션 내내 안 바뀌므로 "같은 사람은 같은 리듬" 이 유지된다.
 * 배열 index 는 입퇴장 때마다 밀려서 못 쓴다.
 */
const crewIdOf = (el: HTMLElement, fallback: number): number =>
  Number(el.closest('[data-crew-id]')?.getAttribute('data-crew-id')) || fallback;

export function useAvatarDance() {
  const avatarEntries = useRef<AvatarEntry[]>([]);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const registerAvatar = (el: HTMLElement | null, motionType: MotionType) => {
    if (!el) return;

    const existingEntry = avatarEntries.current.find((entry) => entry.el === el);
    if (existingEntry) {
      existingEntry.motionType = motionType;
    } else {
      avatarEntries.current.push({
        el,
        motionType,
        // 프레임 루프에서 매번 계산하지 않도록 등록 시 1회만 구한다.
        breathing: breathingRhythm(crewIdOf(el, avatarEntries.current.length)),
      });
    }
  };

  useEffect(() => {
    startTimeRef.current = performance.now();
    const speed = 1;

    const animate = (time: number) => {
      if (!startTimeRef.current) return;
      const t = ((time - startTimeRef.current) / 1000) * speed;

      avatarEntries.current.forEach((entry, index) => {
        const { el, motionType, breathing } = entry;
        const offset = index * 36;
        const angle = t * 360 + offset;

        let transform = '';

        if (motionType === MotionType.DANCE_TYPE_1) {
          const bounceY = Math.abs(fastSin(angle)) * 30;
          const wiggleX = fastSin(angle * 1.2) * 10;
          const rotation = fastSin(angle * 1.5) * 3;
          const scale = 1 + bounceY * 0.01 + fastSin(angle * 1.2) * 0.02;
          transform = `translate(${wiggleX}px, ${-bounceY}px) rotate(${rotation}deg) scale(${scale})`;
        } else if (motionType === MotionType.DANCE_TYPE_2) {
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
        } else if (motionType === MotionType.NONE) {
          // 숨쉬는 듯한 모션. 주기·시작 위상은 아바타마다 다르다 (#463).
          const { period, phase } = breathing;
          const breathPhase = ((t + phase) % period) / period;
          const breathWave = (fastSin(breathPhase * 360) + 1) / 2;
          const scaleChange = 0.04; // 크기 변화량 — 사람마다 같아야 크기가 달라 보이지 않는다
          const scale = 1 + scaleChange * breathWave;
          transform = `scale(${scale})`;
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
