const color = {
  info: '#0490C8',
  success: '#22bb33',
  warn: '#DE793B',
  error: '#C73333',
};

type PrintRequestLogParams = {
  method?: string;
  endPoint?: string;
  requestData?: unknown;
  requestParams?: Record<string, unknown>;
};
export const printRequestLog = ({
  method,
  endPoint,
  requestData,
  requestParams,
}: PrintRequestLogParams) => {
  if (typeof window === 'undefined') {
    console.log(`[REQUEST] ${method?.toUpperCase()} ${endPoint}`);
    return;
  }

  if (Object.keys(requestParams ?? {}).length) {
    console.log(
      `%c${method?.toUpperCase()} ${endPoint} [REQ PARAMS]`,
      `color: ${color.info};font-weight: bold;`,
      requestParams
    );
  }
  console.log(
    `%c${method?.toUpperCase()} ${endPoint} [REQ BODY]`,
    `color: ${color.info};font-weight: bold;`,
    requestData
  );
};

type PrintResponseLogParams = {
  method?: string;
  endPoint?: string;
  response?: unknown;
};
export const printResponseLog = ({ method, endPoint, response }: PrintResponseLogParams) => {
  if (typeof window === 'undefined') {
    console.log(`[RESPONSE SUCCESSFULLY] ${method?.toUpperCase()} ${endPoint}`);
    return;
  }

  console.log(
    `%c${method?.toUpperCase()} ${endPoint} [RES BODY]`,
    `color: ${color.success};font-weight: bold`,
    response
  );
};

type PrintErrorLogParams = {
  method?: string;
  endPoint?: string;
  errorMessage?: string;
  error?: unknown;
};
export const printErrorLog = ({ method, endPoint, errorMessage, error }: PrintErrorLogParams) => {
  if (typeof window === 'undefined') {
    console.error(`[ERROR] ${method?.toUpperCase()} ${endPoint}: ${errorMessage}`);
    return;
  }

  console.log(
    `%c${method?.toUpperCase()} ${endPoint} [ERR]`,
    `color: ${color.error};font-weight: bold`,
    errorMessage,
    error
  );
};
