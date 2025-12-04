import { Currency } from '@awaken/sdk-core';
import Logo from 'components/Logo';
import { ChainConstants } from 'constants/ChainConstants';
import { useMemo } from 'react';
import { getTokenLogoURLs } from 'utils';
import { ImageProps } from 'antd';
import './index.less';
import clsx from 'clsx';
import { NATIVE_LOGO } from 'assets/logo';
import { getPairsLogoOrderByTokenWeights } from 'utils/pair';
import { TokenInfo } from 'types';
import { useGetTokenImage } from 'contexts/useUser/hooks';
import { TCurrency } from 'types/common';
import { formatImageURI } from 'utils/token';
export function CurrencyLogo({
  currency,
  address,
  alt,
  size = 20,
  style,
  src,
  preview,
  className,
  symbol,
}: {
  currency?: TCurrency | TokenInfo | null;
  address?: string;
  size?: number;
  symbol?: string;
} & ImageProps) {
  const getTokenImage = useGetTokenImage();

  const srcs: string[] = useMemo(() => {
    if (src) return [src];

    if (currency) {
      const _srcs: string[] = [];
      if ((currency as Currency).isNative) return [NATIVE_LOGO[currency.symbol || 'ETH']];
      if (currency.imageUri) _srcs.push(formatImageURI(currency.symbol, currency.imageUri as string));
      const key = (currency as Currency).isToken ? (currency as any).address : currency.symbol;
      if (getTokenImage(currency.symbol)) _srcs.push(getTokenImage(currency.symbol));
      const defaultUrls = [..._srcs, ...getTokenLogoURLs(key)];
      return defaultUrls;
    }

    if (address) {
      const { symbol: basesSymbol } = ChainConstants.constants.COMMON_BASES[0] || {};
      if (basesSymbol && address.includes(basesSymbol)) return [NATIVE_LOGO[basesSymbol]];
      const key = ChainConstants.chainType === 'ELF' ? symbol : address;
      return [...getTokenLogoURLs(key)];
    }
    return [];
  }, [address, currency, getTokenImage, src, symbol]);
  return (
    <Logo
      className={className}
      preview={preview}
      style={{
        borderRadius: size / 2,
        width: size,
        height: size,
        ...style,
      }}
      size={size}
      srcs={srcs}
      alt={alt || ((currency as any)?.isNative ? 'ethereum logo' : currency?.symbol) || 'error logo'}
      symbol={symbol || currency?.symbol}
    />
  );
}
export function CurrencyLogos({
  tokens = [{ symbol: '-' }, { symbol: '-' }],
  size = 20,
  preview,
  className,
  isSortToken = true,
}: {
  className?: string;
  preview?: boolean;
  size?: number;
  tokens?: Array<{
    address?: string;
    src?: string;
    currency?: Currency | null;
    symbol?: string;
  }>;
  isSortToken?: boolean;
}) {
  const tokenList = useMemo(() => {
    if (!isSortToken) return tokens;
    return getPairsLogoOrderByTokenWeights(tokens);
  }, [isSortToken, tokens]);

  return (
    <div
      className={clsx('currency-logo', className)}
      style={{
        maxWidth: tokens.length === 1 ? size : `${Math.ceil(size * tokens.length - size / 4)}px`,

        maxHeight: tokens.length === 1 ? size : `${Math.ceil(size * tokens.length - size / 4)}px`,
      }}>
      {tokenList.map((i, k) => {
        const { currency, address, src, symbol } = i || {};
        return (
          <CurrencyLogo
            key={k}
            size={size}
            src={src}
            currency={currency || (i as any)}
            address={address}
            preview={preview}
            symbol={symbol || currency?.symbol}
            style={{
              zIndex: tokens.length - k,
              marginLeft: k === 0 ? 0 : `-${size / 4}px`,
            }}
          />
        );
      })}
    </div>
  );
}
