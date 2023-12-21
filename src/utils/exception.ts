type APIErrorParams = {
  name?: string;
  code?: number;
  message: string;
  status: string;
};
export class APIError extends Error {
  public code?: number;
  public status?: string;
  public constructor({ message, name = 'API Error', code, status }: APIErrorParams) {
    super(name);
    this.name = name;
    this.message = message;
    this.code = code;
    this.status = status;
  }
}
