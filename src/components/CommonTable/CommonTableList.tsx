import CommonTable, { CommonTableProps } from './CommonTable';
import clsx from 'clsx';

import './CommonTableList.less';

export type CommonTableListProps<RecordType> = CommonTableProps<RecordType>;

export default function CommonTableList<RecordType>({ className, ...props }: CommonTableListProps<RecordType>) {
  return <CommonTable sticky pagination={false} {...props} className={clsx('common-table-list', className)} />;
}
