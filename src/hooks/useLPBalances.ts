import BigNumber from 'bignumber.js';
import { useState, useCallback } from 'react';
import { getLPSymbol } from 'utils/swap';
import { useFactoryContract } from './useContract';
import { useActiveWeb3React } from './web3';
import useInterval from './useInterval';
import { ZERO } from 'constants/misc';

export default function useLPBalance(
  // address || symbol
  pairAddr?: string,
  delay: null | number = 10000,
  rate?: string,
): [BigNumber, BigNumber, BigNumber, () => void] {
  const [balance, setBalance] = useState<BigNumber>(ZERO);
  const [lp, setLp] = useState<BigNumber>(ZERO);
  const [supply, setSupply] = useState<BigNumber>(ZERO);
  const { chainId, account } = useActiveWeb3React();
  const factoryContract = useFactoryContract(rate);

  const onGetLPBalance = useCallback(async () => {
    if (!account || !pairAddr || !factoryContract) {
      setBalance(ZERO);
      setLp(ZERO);
      setSupply(ZERO);
      return;
    }
    const lpSymbol = getLPSymbol(pairAddr);
    const tokenInfo = await factoryContract.callViewMethod('GetTokenInfo', {
      symbol: lpSymbol,
    });
    const result = await factoryContract.callViewMethod('GetBalance', {
      symbol: lpSymbol,
      owner: account,
    });

    const supply = new BigNumber((tokenInfo && tokenInfo.supply) || 0);
    const amount = new BigNumber((result && result.amount) || 0);
    if (supply.eq(ZERO) || amount.eq(ZERO)) {
      setBalance(ZERO);
      setLp(ZERO);
      setSupply(ZERO);
      return;
    }
    setLp(amount);
    setSupply(supply);
    const balance = amount.div(supply);
    setBalance(balance);
  }, [pairAddr, account, factoryContract]);

  useInterval(onGetLPBalance, delay, [account, pairAddr, chainId, factoryContract]);
  return [balance, lp, supply, onGetLPBalance];
}
