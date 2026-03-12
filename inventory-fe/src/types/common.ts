type PaginatedMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type SingleResponse<T> = {
  data: T;
};

type ApiResponse<T> = {
  data: T;
};

type ApiPaginatedResponse<T> = {
  data: {
    items: T[];
    meta: PaginatedMeta;
  };
};

type ErrorResponse = {
  error: {
    message: string;
    code?: string;
  };
};

export type {
  PaginatedMeta,
  SingleResponse,
  ApiResponse,
  ApiPaginatedResponse,
  ErrorResponse,
};
