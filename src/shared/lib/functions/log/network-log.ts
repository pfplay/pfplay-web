import { errorLog, infoLog, successLog } from './logger';

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
    infoLog(`[REQUEST] ${method?.toUpperCase()} ${endPoint}`);
    return;
  }

  if (Object.keys(requestParams ?? {}).length) {
    infoLog(`${method?.toUpperCase()} ${endPoint} [REQ PARAMS]`, requestParams);
  }
  infoLog(`${method?.toUpperCase()} ${endPoint} [REQ BODY]`, requestData);
};

type PrintResponseLogParams = {
  method?: string;
  endPoint?: string;
  response?: unknown;
};
export const printResponseLog = ({ method, endPoint, response }: PrintResponseLogParams) => {
  if (typeof window === 'undefined') {
    successLog(`[RESPONSE] ${method?.toUpperCase()} ${endPoint}`);
    return;
  }

  successLog(`${method?.toUpperCase()} ${endPoint} [RES BODY]`, response);
};

type PrintErrorLogParams = {
  method?: string;
  endPoint?: string;
  errorMessage?: string;
  error?: unknown;
};
export const printErrorLog = ({ method, endPoint, errorMessage, error }: PrintErrorLogParams) => {
  if (typeof window === 'undefined') {
    errorLog(`[ERROR] ${method?.toUpperCase()} ${endPoint}: ${errorMessage}`);
    return;
  }

  errorLog(`${method?.toUpperCase()} ${endPoint} [ERR]`, errorMessage, error);
};
