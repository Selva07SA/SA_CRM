export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown, code = "API_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
