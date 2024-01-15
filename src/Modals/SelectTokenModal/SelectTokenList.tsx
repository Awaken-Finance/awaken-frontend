import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import useDebounce from 'hooks/useDebounce';
import { filterTokens, useSortedTokensByQuery } from 'utils/filtering';
import { useAllTokenBalances } from 'hooks/wallet';
import CurrencyRow from './CurrencyRow';
import { useTokenComparator } from './sorting';
import { useTranslation } from 'react-i18next';
import { Token } from 'types';
import { getCurrencyAddress } from 'utils/swap';
import { useMobile } from 'utils/isMobile';

import SearchInput from 'components/SearchInput';
import CommonButton from 'components/CommonButton';
import Font from 'components/Font';

import CommonList from 'components/CommonList';
import { useAllTokenList } from 'hooks/tokenList';
import './styles.less';

export default function SelectTokenList({ onClickManageTokens }: { onClickManageTokens: () => void }) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const allTokens = useAllTokenList();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [invertSearchOrder] = useState<boolean>(false);
  const balances = useAllTokenBalances();

  const debouncedQuery = useDebounce(searchQuery, 200);

  const tokenComparator = useTokenComparator(invertSearchOrder, balances);

  const filteredTokens: Token[] = useMemo(() => {
    return filterTokens(allTokens, debouncedQuery);
  }, [allTokens, debouncedQuery]);

  const sortedTokens: Token[] = useMemo(() => {
    return filteredTokens.sort(tokenComparator);
  }, [filteredTokens, tokenComparator]);

  const filteredSortedTokens = useSortedTokensByQuery(sortedTokens, debouncedQuery);

  const handleInput = useCallback((event) => {
    const input = event.target.value;
    setSearchQuery(input);
  }, []);

  return (
    <div className="select-token-box">
      <div className="input-row">
        <SearchInput placeholder={t('selectATokenPlaceholder')} value={searchQuery} onChange={handleInput} />
      </div>
      <div className="list-row">
        <CommonList
          className={clsx('select-token-list', !isMobile && filteredSortedTokens.length > 9 && 'token-list-large')}
          dataSource={filteredSortedTokens}
          renderItem={(item: any) => (
            <CurrencyRow key={item.address} currency={item} balance={balances[getCurrencyAddress(item)] || 0} />
          )}
          loading={false}
          pageNum={1}
        />
      </div>
      <div className="select-token-button-row">
        <CommonButton type="primary" onClick={onClickManageTokens} size="large">
          <Font size={16} weight="medium">
            {t('manageTokenLists')}
          </Font>
        </CommonButton>
      </div>
    </div>
  );
}
