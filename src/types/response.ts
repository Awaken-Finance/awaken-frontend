export interface Response<T> {
  code?: number;
  message?: string;
  data: T;
}

export type ListResponse<T> = Response<{ totalCount: number; items: T[] }>;
