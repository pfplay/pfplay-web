export type Point = {
  x: number;
  y: number;
};

/**
 * 0, 0은 left-top 기준 (left-bottom 이 아님에 주의)
 */
export type Area = {
  from: Point;
  to: Point;
};

export function getRandomPoints(length: number, allowArea: Area, denyArea: Area): Point[] {
  return Array.from({ length }, () => getRandomPoint(allowArea, denyArea));
}

export function getRandomPoint(allowArea: Area, denyArea: Area): Point {
  let point: Point;
  do {
    point = {
      x: getRandomInt(allowArea.from.x, allowArea.to.x),
      y: getRandomInt(allowArea.from.y, allowArea.to.y),
    };
  } while (!isWithin(point, denyArea));

  return point;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isWithin(point: Point, area: Area): boolean {
  return (
    point.x >= area.from.x && point.x <= area.to.x && point.y >= area.from.y && point.y <= area.to.y
  );
}
