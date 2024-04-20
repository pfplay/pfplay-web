import { AxiosError, AxiosRequestConfig } from 'axios';

const color = {
  info: '#0490C8',
  success: '#22bb33',
  warn: '#DE793B',
  error: '#C73333',
};

type PrintRequestLogParams = {
  method?: string;
  endPoint?: string;
  requestData?: Record<string, unknown>;
  requestParams?: Record<string, unknown>;
  config: AxiosRequestConfig;
};
export const printRequestLog = ({
  method,
  endPoint,
  requestData,
  requestParams,
  config,
}: PrintRequestLogParams) => {
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
  console.log(
    `%c${method?.toUpperCase()} ${endPoint} [REQ HEADERS]`,
    `color: ${color.info};font-weight: bold;`,
    config.headers
  );
  console.log(
    `%c${method?.toUpperCase()} ${endPoint} [REQ CONFIG]`,
    `color: ${color.info};font-weight: bold;`,
    config
  );
};

type PrintResponseLogParams = {
  method?: string;
  endPoint?: string;
  responseObj?: Record<string, unknown>;
};
export const printResponseLog = ({ method, endPoint, responseObj }: PrintResponseLogParams) => {
  console.log(
    `%c${method?.toUpperCase()} ${endPoint} [RES BODY]`,
    `color: ${color.success};font-weight: bold`,
    responseObj
  );
};

type PrintErrorLogParams = {
  method?: string;
  endPoint?: string;
  errorMessage?: string;
  errorObj?: AxiosError;
};
export const printErrorLog = ({
  method,
  endPoint,
  errorMessage,
  errorObj,
}: PrintErrorLogParams) => {
  console.log(
    `%c${method?.toUpperCase()} ${endPoint} [ERR]`,
    `color: ${color.error};font-weight: bold`,
    errorMessage,
    errorObj
  );
};
