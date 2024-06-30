import { successLog, infoLog, errorLog } from './logger';

describe('logger', () => {
  let consoleSpy: jest.SpyInstance;

  const mockMessage = 'test message';
  const mockData = { key: 'value' };

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('should log a success message with correct style', () => {
    successLog(mockMessage, mockData);
    expect(consoleSpy).toHaveBeenCalledWith(
      `%c${mockMessage}`,
      'color: #22bb33;font-weight: bold;',
      mockData
    );
  });

  test('should log an info message with correct style', () => {
    infoLog(mockMessage, mockData);
    expect(consoleSpy).toHaveBeenCalledWith(
      `%c${mockMessage}`,
      'color: #0490C8;font-weight: bold;',
      mockData
    );
  });

  test('should log an error message with correct style', () => {
    errorLog(mockMessage, mockData);
    expect(consoleSpy).toHaveBeenCalledWith(
      `%c${mockMessage}`,
      'color: #C73333;font-weight: bold;',
      mockData
    );
  });
});
