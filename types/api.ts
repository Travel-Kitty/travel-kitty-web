export type ApiSuccess<T> = {
  success: true;
  data: T;
  error: null;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  data: null;
  error: {
    code: string; // short machine readable code
    message: string; // human readable message
    details?: unknown; // optional extra info
  };
  meta?: Record<string, unknown>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
