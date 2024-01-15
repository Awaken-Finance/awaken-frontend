import { Currency } from '@awaken/sdk-core';
import { useAsyncState } from 'hooks';
import { useCallback, useEffect } from 'react';
import { useFactoryContracts } from '../hooks/useContract';
import { Pairs } from 'types/swap';
import { ContractInterface } from 'utils/contract';
import useInterval from 'hooks/useInterval';
import { getLPSymbol } from 'utils/swap';
import { useAElfContract } from 'contexts/useAElfContract/hooks';
export function usePairs(t1?: Currency, t2?: Currency): [Pairs | undefined, () => void] {
  const factoryContracts = useFactoryContracts();
  const [pairs, setPairs] = useAsyncState<Pairs>();
  const getPairs = useCallback(async () => {
    if (!t1 || !t2) return;
    const obj: { [k: string]: string } = {};
    const factoryList = Object.entries(factoryContracts);
    const p = factoryList.map(([, contracts]) => {
      return contracts?.callViewMethod('GetTokenInfo', [getLPSymbol([t1, t2])]);
    });
    const pairs = await Promise.all(p);
    pairs.forEach((i, index) => {
      if (i && !i.error) {
        const k: string = factoryList[index][0];
        obj[k] = `${t1.symbol}-${t2.symbol}`;
      }
    });
    setPairs(obj);
  }, [factoryContracts, setPairs, t1, t2]);
  useEffect(() => {
    getPairs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factoryContracts, t1, t2]);
  return [pairs, getPairs];
}
type Reserves = {
  [key: string]: string;
};
export const getPairInfo = async (pairContract: ContractInterface, pairAddress: string) => {
  if (pairContract.contractType === 'ELF') {
    const [reserves, totalSupplys] = await Promise.all([
      pairContract.callViewMethod('getReserves', [[pairAddress]]),
      pairContract.callViewMethod('GetTotalSupply', [[pairAddress]]),
    ]);
    if (reserves.error || totalSupplys.error) return {};
    const { reserveA: reserve0, reserveB: reserve1, symbolA: token0, symbolB: token1 } = reserves.results?.[0] || {};
    const { totalSupply } = totalSupplys.results?.[0] || {};
    return { reserve0, reserve1, token0, token1, totalSupply };
  }
  const [pair, token0, token1, totalSupply] = await Promise.all([
    pairContract.callViewMethod('getReserves'),
    pairContract.callViewMethod('token0'),
    pairContract.callViewMethod('token1'),
    pairContract.callViewMethod('totalSupply'),
  ]);
  return {
    reserve0: pair._reserve0 || '0',
    reserve1: pair._reserve1 || '0',
    token0,
    token1,
    totalSupply,
  };
};
export function usePair(pairAddress?: string, routerAddress?: string) {
  const [reserves, setPairReserves] = useAsyncState<Reserves | undefined>();
  const [totalSupply, setTotalSupply] = useAsyncState<string | undefined>();
  const routerContract = useAElfContract(routerAddress || '');
  const getReserves = useCallback(async () => {
    if (!pairAddress || !routerAddress) return setPairReserves(undefined);
    const contract = routerContract;
    if (!contract) return;
    const { token0, token1, reserve0, reserve1, totalSupply } = await getPairInfo(contract, pairAddress);
    setPairReserves({
      [token0]: reserve0 || '0',
      [token1]: reserve1 || '0',
    });
    setTotalSupply(totalSupply);
  }, [pairAddress, routerAddress, routerContract, setPairReserves, setTotalSupply]);
  useInterval(
    () => {
      getReserves();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    10000,
    [pairAddress, routerContract],
  );
  return { reserves, totalSupply, getReserves };
}

export function usePairsAddress(rate: string, t1?: Currency, t2?: Currency) {
  if (!t1 || !t2) return;
  return t1?.symbol + '-' + t2?.symbol;
}
