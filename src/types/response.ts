export interface Response<T> {
  code?: number;
  message?: string;
  data: T;
}

export type TListResponseData<T> = { totalCount: number; items: T[] };

export type ListResponse<T> = Response<TListResponseData<T>>;
