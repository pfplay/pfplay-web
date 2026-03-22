import { getRandomPoint } from './avatar-position.model';

describe('avatar-position.model', () => {
  describe('getRandomPoint', () => {
    test('allowArea 안에 속하면서 denyArea 에는 속하지 않는 point를 반환해야 한다.', () => {
      const allowArea = {
        from: { x: 0, y: 0 },
        to: { x: 100, y: 100 },
      };
      const denyArea = {
        from: { x: 0, y: 0 },
        to: { x: 50, y: 50 },
      };

      for (let i = 0; i < 1000; i++) {
        const result = getRandomPoint(allowArea, denyArea);

        const isWithInAllowArea =
          result.x >= allowArea.from.x &&
          result.x <= allowArea.to.x &&
          result.y >= allowArea.from.y &&
          result.y <= allowArea.to.y;

        const isWithInDenyArea =
          result.x >= denyArea.from.x &&
          result.x <= denyArea.to.x &&
          result.y >= denyArea.from.y &&
          result.y <= denyArea.to.y;

        expect(isWithInAllowArea).toBe(true);
        expect(isWithInDenyArea).toBe(false);
      }
    });
  });
});
