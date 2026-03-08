import { AvatarCompositionType } from '@/shared/api/http/types/@enums';

export type Model = {
  /**
   * body의 uri
   */
  bodyUri: string;
  /**
   * 아바타 합성 타입 (SINGLE_BODY | BODY_WITH_FACE)
   */
  compositionType?: AvatarCompositionType;
  /**
   * face의 uri
   */
  faceUri?: string;
  /**
   * face의 BODY_BASE_WIDTH 기준 x축 위치. face width 중앙까지 측정한 값
   */
  facePosX?: number;
  /**
   * face의 BODY_BASE_HEIGHT 기준 y축 위치. face height 상단까지 측정한 값
   */
  facePosY?: number;
  /**
   * body 내 face 중앙점을 (0,0) 기준으로 좌(-), 우(+) 이동 얼굴 너비 대비 비율
   */
  offsetX?: number;
  /**
   * body 내 face 중앙점을 (0,0) 기준으로 위(-), 아래(+) 이동 얼굴 높이 대비 비율
   */
  offsetY?: number;
  /**
   * face 크기 조절 배율
   */
  scale?: number;
};
