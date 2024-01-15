import { useRef, useMemo, ReactNode } from 'react';
import clsx from 'clsx';

import { Table, TablePaginationConfig, TableProps } from 'antd';

import { FetchParam } from 'types/requeset';
import CommonEmpty from 'components/CommonEmpty';
import { SortOrder } from 'antd/lib/table/interface';

import './index.less';

declare type TablePaginationPosition =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

export interface CommonTableProps<T> extends Omit<TableProps<T>, 'onChange'> {
  total?: number;
  pageNum?: number;
  pageSize?: number;
  position?: TablePaginationPosition[];
  className?: string;
  order?: SortOrder | undefined | null;
  field?: string | null;
  loading?: boolean;
  emptyType?: 'nodata' | 'search' | 'internet' | ReactNode | (() => ReactNode) | null;
  emptyText?: string;
  emptyPic?: string;
  onChange?: (
    fetchParams: FetchParam,
    pagination?: TablePaginationConfig,
    filters?: any,
    sorter?: any,
    extra?: any,
  ) => void;
  pagination?: TablePaginationConfig | false;
}

export type TableFetchParams = Omit<FetchParam, 'searchVal' | 'poolType'>;

export default function CommonTable({
  onChange,
  total,
  pageNum,
  pageSize,
  position,
  className,
  loading,
  emptyType,
  emptyText,
  emptyPic,
  ...params
}: CommonTableProps<any>) {
  const fetchParams = useRef<TableFetchParams>({
    page: 1,
    pageSize: pageSize,
    field: null,
    order: null,
  });

  const pagination = useRef<TablePaginationConfig | false>({
    current: 1,
    pageSize: pageSize,
    total: 0,
  });

  const tableChange = (pagination: TablePaginationConfig, filters: any, sorter: any, extra: any) => {
    switch (extra.action) {
      case 'paginate':
        fetchParams.current = {
          ...fetchParams.current,
          page: pagination.current,
          pageSize: pagination.pageSize,
        };
        break;
      case 'sort':
        if (!sorter.order) {
          fetchParams.current.field = null;
          fetchParams.current.order = null;
        } else {
          fetchParams.current = {
            ...fetchParams.current,
            field: sorter.field,
            order: sorter.order,
          };
        }
        break;
      case 'filter': {
        fetchParams.current.filter = filters;
        break;
      }
    }
    onChange && onChange(fetchParams.current, pagination, filters, sorter, extra);
  };

  const paginationConfig = useMemo(() => {
    pagination.current = {
      ...pagination.current,
      current: pageNum,
      pageSize,
      total,
      position,
      // showSizeChanger: true,
      hideOnSinglePage: true,
      defaultPageSize: pageSize,
      // pageSizeOptions: [10, 20, 30, 50],
    };
    return pagination.current;
  }, [total, pageNum, pageSize, position]);

  type EmptyType = 'nodata' | 'search' | 'internet';
  function emptyStatus() {
    let type: EmptyType;
    if (!emptyType) {
      type = 'nodata';
    } else if (emptyType === 'nodata' || emptyType === 'search' || emptyType === 'internet') {
      type = emptyType;
    } else if (typeof emptyType === 'function') {
      return emptyType();
    } else {
      return emptyType;
    }

    return <CommonEmpty type={type} desc={emptyText} pic={emptyPic} />;
  }

  return (
    <div className={clsx('common-table', className)}>
      <Table
        onChange={tableChange}
        pagination={paginationConfig}
        loading={loading}
        showSorterTooltip={false}
        {...params}
        locale={{
          emptyText: emptyStatus(),
        }}
      />
    </div>
  );
}
