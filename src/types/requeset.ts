import { SortOrder } from 'antd/lib/table/interface';

export interface FetchParam {
  order?: SortOrder | null;
  field?: string | null;
  page?: number;
  pageSize?: number;

  searchVal?: string;
  poolType?: string;
  chainId?: string | undefined;
  address?: string;
  tokenSymbol?: string;
  sorting?: string | null;
  skipCount?: number;
  maxResultCount?: number;
  filter?: {
    [x: string]: any[];
  };
}
