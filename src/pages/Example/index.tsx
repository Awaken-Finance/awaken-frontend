import { Divider } from 'antd';
import BigNumber from 'bignumber.js';
import PriceDecimalsSinkProps from 'components/PriceDecimalsSinkProps';
import PriceDigits from 'components/PriceDigits';
import { TSize } from 'types';
import { divDecimals } from 'utils/calculate';
import { getPriceScale } from 'utils/price';

const price = new BigNumber('112222333');

export default function Example() {
  return (
    <div>
      {new Array(10).fill('').map((t, index) => {
        let size: TSize = 'default';
        const s = index % 3;
        if (s === 1) size = 'small';
        if (s === 2) size = 'large';
        const _price = divDecimals(price, index * 2);
        return (
          <div key={index}>
            <PriceDecimalsSinkProps style={{ color: 'red' }} price={_price} />;<div></div>
            <PriceDigits style={{ color: 'green' }} size={size} price={_price} />
            <div style={{ color: 'white', fontSize: 12 }}>Digits: {getPriceScale(_price)}</div>
            <Divider />
          </div>
        );
      })}
      <Divider />
    </div>
  );
}
