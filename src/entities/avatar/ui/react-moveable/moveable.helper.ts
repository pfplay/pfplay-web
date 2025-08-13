import { AvatarFacePos } from '@/shared/api/http/types/users';

type SetFacePosFn = (facePos: AvatarFacePos) => void;

class MoveableHelper {
  private facePos: AvatarFacePos;
  private onFacePosChange: SetFacePosFn;
  private faceWidth: number;
  private faceHeight: number;

  public constructor(
    initialFacePos: AvatarFacePos | undefined,
    onFacePosChange: SetFacePosFn,
    faceWidth: number,
    faceHeight: number
  ) {
    this.facePos = initialFacePos || {
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    };
    this.onFacePosChange = onFacePosChange;
    this.faceWidth = faceWidth;
    this.faceHeight = faceHeight;
  }

  public onDrag = (e: any) => {
    const [x, y] = e.beforeTranslate; // 이동 px 단위 기록
    this.facePos = {
      ...this.facePos,
      offsetX: x / this.faceWidth,
      offsetY: y / this.faceHeight,
    };

    this.onFacePosChange(this.facePos);
  };

  public onScale = (e: any) => {
    const zoomRatio = e.scale[0];
    this.facePos = {
      ...this.facePos,
      scale: zoomRatio,
    };

    this.onFacePosChange(this.facePos);
  };
}

export { MoveableHelper };
