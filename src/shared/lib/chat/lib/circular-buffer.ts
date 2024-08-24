export default class CircularBuffer<T> {
  private readonly max: number;
  private readonly buffer: T[];
  private start: number;
  private end: number;
  private length: number;

  public constructor(initialBuffer: T[], max: number) {
    if (initialBuffer.length > max) {
      throw new Error('Initial buffer length cannot exceed max length');
    }

    this.max = max;
    this.buffer = initialBuffer;
    this.length = initialBuffer.length;
    this.start = 0;
    this.end = initialBuffer.length;
  }

  public append(item: T): void {
    this.buffer[this.end] = item; // 원형 버퍼의 끝 인덱스에 저장
    this.end = (this.end + 1) % this.max; // 끝 인덱스 순환

    if (this.length < this.max) {
      this.length++;
    } else {
      this.start = (this.start + 1) % this.max; // 시작 인덱스 순환
    }
  }

  public get list(): T[] {
    const result = new Array<T>(this.length);

    for (let i = 0; i < this.length; i++) {
      result[i] = this.buffer[(this.start + i) % this.max]; // 순서대로 결과 배열에 저장
    }

    return result;
  }
}
