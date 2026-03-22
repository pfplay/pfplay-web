const logColors = {
  info: '#0490C8',
  success: '#22bb33',
  warn: '#DE793B',
  error: '#C73333',
  specific: '#CA5CDD',
};

const logger =
  (color: keyof typeof logColors) =>
  (message: string, ...data: any[]) => {
    console.log(`%c${message}`, `color: ${logColors[color]};font-weight: bold;`, ...data);
  };

export const infoLog = logger('info');
export const successLog = logger('success');
export const warnLog = logger('warn');
export const errorLog = logger('error');
export const specificLog = logger('specific');
