import { Divider, Space } from 'antd';
import BigNumber from 'bignumber.js';
import PriceDecimalsSink from 'components/PriceDecimalsSink';
import PriceDigits from 'components/PriceDigits';
import PriceUSDDecimalsSink from 'components/PriceUSDDecimalsSink';
import PriceUSDDigits from 'components/PriceUSDDigits';
import { TSize } from 'types';
import { divDecimals } from 'utils/calculate';
import { getPriceScale } from 'utils/price';

const price = new BigNumber('112222333');

export default function Example() {
  return (
    <div>
      {new Array(20).fill('').map((t, index) => {
        let size: TSize = 'default';
        const s = index % 3;
        if (s === 1) size = 'small';
        if (s === 2) size = 'large';
        const _price = divDecimals(price, index);
        return (
          <div key={index}>
            <Space align="start">
              <div>
                <PriceDecimalsSink size={size} style={{ color: 'red' }} price={_price} />
                <div></div>
                <PriceDigits style={{ color: 'green' }} size={size} price={_price} />
                <div style={{ color: 'white', fontSize: 12 }}>Digits: {getPriceScale(_price)}</div>
              </div>
              <div>
                <PriceUSDDecimalsSink style={{ color: 'green' }} size={size} price={_price} />
                <div></div>

                <PriceUSDDigits size={size} style={{ color: 'red' }} price={_price} />
              </div>
            </Space>

            <div style={{ paddingBottom: 2, marginBottom: 4, background: 'white' }} />
          </div>
        );
      })}
      <Divider />
    </div>
  );
}
