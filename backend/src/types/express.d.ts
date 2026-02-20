import { AccessPayload } from "../utils/token";

declare global {
  namespace Express {
    interface Request {
      auth?: AccessPayload;
      tenantId?: string;
    }
  }
}

export {};
