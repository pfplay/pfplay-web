import { FacePos } from '../../model/avatar.model';

type SetFacePosFn = (facePos: FacePos) => void;

class MoveableHelper {
  private facePos: FacePos;
  private onFacePosChange: SetFacePosFn;
  private faceWidth: number;
  private faceHeight: number;

  public constructor(
    initialFacePos: FacePos,
    onFacePosChange: SetFacePosFn,
    faceWidth: number,
    faceHeight: number
  ) {
    this.facePos = initialFacePos;
    this.onFacePosChange = onFacePosChange;
    this.faceWidth = faceWidth;
    this.faceHeight = faceHeight;
  }

  public onDrag = (e: any) => {
    const [x, y] = e.beforeTranslate;

    this.facePos = {
      ...this.facePos,
      offsetX: (x / this.faceWidth) * 100,
      offsetY: (y / this.faceHeight) * 100,
    };

    this.onFacePosChange(this.facePos);
  };

  public onScale = (e: any) => {
    const zoomPercent = e.scale[0] * 100;

    this.facePos = {
      ...this.facePos,
      zoom: zoomPercent,
    };

    this.onFacePosChange(this.facePos);
  };
}

export { MoveableHelper };
