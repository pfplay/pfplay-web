export default class CircularBuffer<T> {
  private readonly max: number;
  private buffer: T[];
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

  public clear(): void {
    this.start = 0;
    this.end = 0;
    this.length = 0;
    this.buffer = new Array<T>(this.max);
  }

  /**
   * 순환 버퍼의 요소들을 업데이트합니다.
   *
   * @param predicate 업데이트할 항목을 결정하는 조건 함수입니다. true를 반환하면 해당 항목이 업데이트됩니다.
   * @param updater 조건에 맞는 항목을 업데이트하는 함수입니다. 현재 항목을 입력받아 업데이트된 항목을 반환하고 즉시 종료합니다.
   *
   * @example
   * // 짝수 번째 항목의 값을 두 배로 만듭니다.
   * circularBuffer.update(
   *   (item) => item % 2 === 0,
   *   (item) => item * 2
   * );
   */
  public update(predicate: (item: T) => boolean, updater: (item: T) => T): T | undefined {
    for (let i = 0; i < this.length; i++) {
      const index = (this.start + i) % this.max;
      if (predicate(this.buffer[index])) {
        const updatedItem = updater(this.buffer[index]);
        this.buffer[index] = updatedItem;
        return updatedItem; // 업데이트된 항목을 반환하고 루프 즉 종료
      }
    }
    return undefined; // 조건에 맞는 항목을 찾지 못한 경우
  }
}
