import { useLanguage } from '../../i18n';
import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { usePrevious } from 'react-use';
import { LanguageCode, ResolutionString } from './dts/charting_library';
import TV from './TV';
import { useSwapContext } from 'pages/Exchange/hooks/useSwap';
import { useUrlParams } from 'hooks/Exchange/useUrlParams';
import { useMobile } from 'utils/isMobile';
import { useActiveWeb3React } from 'hooks/web3';
import { SupportedSwapRate, SupportedSwapRateIndex } from 'constants/swap';

type themeName = 'Dark' | 'Light';
const TradingView: React.FC<{
  Theme?: themeName;
  Resolution?: ResolutionString;
  isFullScreen?: boolean;
  setLoading?: Dispatch<SetStateAction<boolean>>;
}> = ({ setLoading = () => null }) => {
  const [createChart, setChart] = useState<any>(false);
  const { apiChainId } = useActiveWeb3React();

  const symbolItem = useUrlParams();
  const [{ socket }] = useSwapContext();
  const prevChart = usePrevious(createChart);
  const prevSymbol = usePrevious(symbolItem);

  const feeRate = useMemo(() => {
    return (SupportedSwapRate[symbolItem.feeRate as SupportedSwapRateIndex] ?? '') + '%';
  }, [symbolItem.feeRate]);

  const prevFeeRate = usePrevious(feeRate);
  const { language } = useLanguage();
  const LanguagePrev = usePrevious(language);
  const apiChainIdPrev = usePrevious(apiChainId);
  const isMobile = useMobile();

  useEffect(() => {
    if (!symbolItem.id || !symbolItem.symbol) return;
    if (!apiChainId || !socket) return;

    const pairData = { tradePairId: symbolItem.id, symbol: symbolItem.symbol, chainId: apiChainId, feeRate };

    try {
      if (!createChart) {
        const TVChart = new TV({
          pairData,
          SocketApi: socket,
          isMobile,
          Locale: language as LanguageCode,
          onReadyCallback: () => setLoading(false),
        });
        setChart(TVChart);
      } else {
        if (LanguagePrev !== language || apiChainId !== apiChainIdPrev) {
          setLoading(true);
          const TVChart = new TV({
            pairData,
            SocketApi: socket,
            isMobile,
            Locale: language as LanguageCode,
            onReadyCallback: () => setLoading(false),
          });
          setChart(TVChart);
          return;
        }

        prevSymbol?.id !== symbolItem.id &&
          prevChart === createChart &&
          createChart?.setSymbol(pairData, () => {
            setLoading(false);
          });
      }
    } catch (e) {
      console.log('tradView init error', e);
    }
  }, [
    symbolItem,
    createChart,
    prevChart,
    socket,
    language,
    LanguagePrev,
    prevSymbol?.id,
    apiChainId,
    symbolItem.id,
    isMobile,
    prevFeeRate,
    feeRate,
    apiChainIdPrev,
    setLoading,
  ]);

  return <div id="tv_chart_container" style={{ height: '100%' }} />;
};
export default TradingView;
