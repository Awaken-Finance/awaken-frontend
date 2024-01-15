import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { useActiveWeb3React } from 'hooks/web3';
import { FetchParam } from 'types/requeset';

import { PinnedToken } from 'types';

import { useTranslation } from 'react-i18next';
import CollectionBtn from 'Buttons/CollectionBtn';
import { pinnedTokens } from 'hooks/Exchange/useTradePair';
import { useRequest, useUpdateEffect } from 'ahooks';
import useLoginCheck from 'hooks/useLoginCheck';

import { useMobile } from 'utils/isMobile';

import { Button } from 'antd';
import { Swiper, SwiperSlide } from 'swiper/react';

import './index.less';
import 'swiper/css';
import { IconArrowRight, IconArrowLeft } from 'assets/icons';

interface TradingMeunListProps {
  onChange?: (params: FetchParam, symbolList?: string[], pinned_tokens?: PinnedToken[]) => void;
  onTokenListChange?: (selectToken: PinnedToken, pinned_tokens?: PinnedToken[]) => void;
  className?: string;
  source?: string;
}

const defaultMeunList = [
  { tokenId: 'fav', symbol: 'fav' },
  { tokenId: 'other', symbol: 'other' },
];

export default function TradingMeunList({
  onChange,
  className = '',
  source = 'trading',
  onTokenListChange = () => null,
}: TradingMeunListProps) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const { chainId } = useActiveWeb3React();

  const [poolType, setPoolType] = useState<string>('');

  const [isShowLeft, setIsShowLeft] = useState<boolean>(false);
  const [isShowRight, setIsShowRight] = useState<boolean>(false);
  const swiperRef = useRef<any>();

  const loginStatus = useLoginCheck({ checkAccountSync: true });

  const symbolList = useRef<string[]>();

  const { data: pinned_tokens = [], run: getTookens } = useRequest((chainId: string) => pinnedTokens(chainId), {
    manual: true,
  });

  const poolTypeChange = useCallback(
    (v) => {
      if (v === poolType) {
        return;
      }

      if (v === 'fav' && !loginStatus()) {
        return;
      }

      onChange && onChange({ poolType: v }, symbolList.current, pinned_tokens);

      setPoolType(v);
    },
    [onChange, poolType, pinned_tokens, loginStatus],
  );

  const menuList = useMemo(() => {
    const list = [...defaultMeunList];
    if (pinned_tokens) {
      list.splice(1, 0, ...pinned_tokens);
    }
    return list;
  }, [pinned_tokens]);

  const renderMeun = useMemo(() => {
    return menuList.map(({ tokenId, symbol }) => {
      if (tokenId === 'fav') {
        return (
          <SwiperSlide key={tokenId} className={clsx('menu-item', poolType === tokenId && 'menu-item-active')}>
            <CollectionBtn checked={poolType === symbol} onChange={() => poolTypeChange(symbol)} key={symbol} />
          </SwiperSlide>
        );
      }
      return (
        <SwiperSlide
          key={tokenId}
          className={clsx('menu-item', poolType === tokenId && 'menu-item-active')}
          onClick={() => poolTypeChange(tokenId)}>
          {t(symbol)}
        </SwiperSlide>
      );
    });
  }, [menuList, poolType, t, poolTypeChange]);

  useUpdateEffect(() => {
    if (pinned_tokens?.length) {
      symbolList.current = pinned_tokens.map(({ symbol }) => symbol);

      onChange && onChange({ poolType: pinned_tokens[0]?.tokenId }, symbolList.current, pinned_tokens);

      onTokenListChange(pinned_tokens[0], pinned_tokens);
      setPoolType(pinned_tokens[0]?.tokenId);
    }
  }, [pinned_tokens]);

  useEffect(() => {
    getTookens(chainId);
  }, [chainId, getTookens]);

  useEffect(() => {
    if (swiperRef.current.virtualSize > swiperRef.current.width) {
      setIsShowRight(true);
    }
  }, [swiperRef.current?.virtualSize]);

  const SwiperButtonNext = () => {
    return (
      <Button
        type="text"
        icon={<IconArrowRight />}
        className={clsx('menu-right-button', source === 'market' && 'market-background-color')}
        onClick={() => {
          const translate = swiperRef.current.translate;
          const snapGrid = swiperRef.current.snapGrid;
          swiperRef.current.slideNext();
          if (Math.abs(translate) === snapGrid[snapGrid.length - 3]) {
            setIsShowRight(false);
          }
          setIsShowLeft(true);
        }}
      />
    );
  };
  const SwiperButtonPrev = () => {
    return (
      <Button
        type="text"
        icon={<IconArrowLeft />}
        className={clsx('menu-left-button', source === 'market' && 'market-background-color')}
        onClick={() => {
          const translate = swiperRef.current.translate;
          const snapGrid = swiperRef.current.snapGrid;
          swiperRef.current.slidePrev();
          if (Math.abs(translate) === snapGrid[1]) {
            setIsShowLeft(false);
          }
          setIsShowRight(true);
        }}
      />
    );
  };

  let spaceBetween = 24;
  if (isMobile) {
    spaceBetween = source === 'market' ? 12 : 20;
  } else {
    spaceBetween = source === 'market' ? 24 : 16;
  }

  return (
    <Swiper
      onSwiper={(swiper: any) => {
        swiperRef.current = swiper;
      }}
      spaceBetween={spaceBetween}
      slidesPerView="auto"
      className={clsx('trade-meun-list', className, isShowLeft && 'is-show-left-arrow')}>
      {isShowLeft && <SwiperButtonPrev />}
      {renderMeun}
      {isShowRight && <SwiperButtonNext />}
    </Swiper>
  );
}
