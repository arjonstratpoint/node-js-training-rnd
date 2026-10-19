import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface ResponseLocals {
    valid?: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
  }
}
