export type Model = {
  /**
   * body의 uri
   */
  bodyUri: string;
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
};
