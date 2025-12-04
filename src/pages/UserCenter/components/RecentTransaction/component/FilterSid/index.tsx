import { Row, Col } from 'antd';
import Font from 'components/Font';
import { IconCheckPrimary } from 'assets/icons';
import { ColumnFilterItem } from 'antd/lib/table/interface';
import { useTranslation } from 'react-i18next';

import './index.less';

export const filterSidSource = [
  {
    text: 'all',
    value: -1,
  },
  {
    text: 'buy',
    value: 0,
  },
  {
    text: 'sell',
    value: 1,
  },
];

export function getSideTitle(side?: number): string {
  if (typeof side === 'undefined' || side === null || side === -1) {
    return 'side';
  }

  return ['buy', 'sell'][side];
}

interface FilterProps<T> {
  onChange: (val: T) => void;
  val: T;
}

export default function Filter({ onChange, val }: FilterProps<number>) {
  const { t } = useTranslation();
  return (
    <Row className="filter-list">
      {filterSidSource?.map(({ text, value }) => (
        <Col span={24} className="filter-list-item" key={value} onClick={() => onChange(value)}>
          <Font color={value === val ? 'one' : 'two'}>{t(text)}</Font>
          {value === val && <IconCheckPrimary />}
        </Col>
      ))}
    </Row>
  );
}

interface FilterSidProps<T> {
  selectedKeys: T[];
  setSelectedKeys: (selectedKeys: T[]) => void;
  confirm: () => void;
  filters: ColumnFilterItem[];
  onChange: (val: T[]) => void;
}

export function FilterSidInTable({ selectedKeys, setSelectedKeys, confirm }: FilterSidProps<number>) {
  const handleSelect = (val: number) => {
    setSelectedKeys([val]);
    confirm();
  };

  return <Filter onChange={handleSelect} val={selectedKeys?.[0]} />;
}
