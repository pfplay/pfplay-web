import withDebugger from './with-debugger';

describe('withDebugger', () => {
  describe('when production mode', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'production';
    });

    describe('when window.debugLevel is greater than given', () => {
      test('should call the function', () => {
        // Arrange
        const debugLevel = 0;
        const fn = jest.fn();
        const args = [1, 2, 3];
        window.debugLevel = debugLevel + 1;

        // Act
        withDebugger(debugLevel)(fn)(...args);

        // Assert
        expect(fn).toHaveBeenCalledWith(...args);
      });

      test('should return the result of the function', () => {
        // Arrange
        const debugLevel = 0;
        const fn = jest.fn().mockReturnValue('result');
        const args = [1, 2, 3];
        window.debugLevel = debugLevel + 1;

        // Act
        const result = withDebugger(debugLevel)(fn)(...args);

        // Assert
        expect(result).toBe('result');
      });
    });

    describe('when window.debugLevel is equal to given', () => {
      test('should not call the function', () => {
        // Arrange
        const debugLevel = 1;
        const fn = jest.fn();
        const args = [1, 2, 3];
        window.debugLevel = debugLevel;

        // Act
        withDebugger(debugLevel)(fn)(...args);

        // Assert
        expect(fn).not.toHaveBeenCalledWith(...args);
      });

      test('should return the fallback value', () => {
        // Arrange
        const debugLevel = 1;
        const fn = jest.fn();
        const args = [1, 2, 3];
        const fallback = 'fallback';
        window.debugLevel = debugLevel;

        // Act
        const result = withDebugger(debugLevel)(fn, fallback)(...args);

        // Assert
        expect(result).toBe(fallback);
      });
    });
    describe('when window.debugLevel is less than given', () => {
      test('should not call the function', () => {
        // Arrange
        const debugLevel = 2;
        const fn = jest.fn();
        const args = [1, 2, 3];
        window.debugLevel = debugLevel - 1;

        // Act
        withDebugger(debugLevel)(fn)(...args);

        // Assert
        expect(fn).not.toHaveBeenCalledWith(...args);
      });
    });
  });
  describe('when development mode', () => {
    beforeAll(() => {
      process.env.NODE_ENV = 'development';
    });

    test('should call the function', () => {
      // Arrange
      const debugLevel = 0;
      const fn = jest.fn();
      const args = [1, 2, 3];
      window.debugLevel = debugLevel;

      // Act
      withDebugger(debugLevel)(fn)(...args);

      // Assert
      expect(fn).toHaveBeenCalledWith(...args);
    });
  });
});
