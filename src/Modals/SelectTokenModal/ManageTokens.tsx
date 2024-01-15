import { Button, Col, List, Row } from 'antd';
import { useAddUserToken, useUserAddedTokens } from 'contexts/useUser/hooks';
import { useActiveWeb3React } from 'hooks/web3';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CurrencyLogo } from 'components/CurrencyLogo';
import { useTranslation } from 'react-i18next';

import SearchInput from 'components/SearchInput';
import { Token } from 'types';
import Font from 'components/Font';
import { IconAddCircle, IconCheckCircle } from 'assets/icons';
import useDebounce from 'hooks/useDebounce';
import { useTokenContract } from 'hooks/useContract';

import CommonEmpty from 'components/CommonEmpty';
import { useMobile } from 'utils/isMobile';

export default function ManageTokens() {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedQuery = useDebounce(searchQuery, 500);
  const [searchedTokenInfo, setSearchTokenInfo] = useState<Token | undefined>();
  // const searchToken = useToken(debouncedQuery);
  const handleInput = useCallback((event) => {
    const input = event.target.value;
    setSearchQuery(input);
  }, []);
  const addedTokens = useUserAddedTokens();
  const addToken = useAddUserToken();

  const tokenContract = useTokenContract();

  const isMobile = useMobile();

  const searchTokenInfo = useCallback(
    async (query: string) => {
      if (!tokenContract) return;
      const tokenInfo = await tokenContract.callViewMethod('GetTokenInfo', [query]);
      if (!tokenInfo) {
        setSearchTokenInfo(undefined);
        return;
      }
      tokenInfo.chainId = chainId;
      tokenInfo.address = tokenInfo.symbol;
      setSearchTokenInfo(tokenInfo);
    },
    [chainId, tokenContract],
  );

  useEffect(() => {
    setSearchTokenInfo(undefined);
    searchTokenInfo(debouncedQuery);
  }, [debouncedQuery, searchTokenInfo]);

  const customTokenData = useMemo(() => {
    const addedTokensMap = new Map<string, boolean>();
    const tokens: Token[] = [];
    if (searchedTokenInfo) {
      addedTokensMap.set(searchedTokenInfo.symbol, true);
      tokens.push(searchedTokenInfo);
    } else {
      addedTokens.forEach((token) => {
        if (addedTokensMap.has(token.symbol)) {
          return;
        }
        if (token.symbol.toLowerCase().indexOf(searchQuery.trim().toLowerCase()) !== -1) {
          addedTokensMap.set(token.symbol, true);
          tokens.push(token);
        }
      });
    }
    return {
      tokens,
    };
  }, [addedTokens, searchQuery, searchedTokenInfo]);

  const onClickAddToken = (token: Token) => {
    addToken(token);
  };

  return (
    <div className="manage-tokens">
      <div className="search-row">
        <SearchInput placeholder={t('tokenSymbolPlaceholder')} value={searchQuery} onChange={handleInput} />
      </div>
      {!customTokenData.tokens.length && (
        <>
          <Row className="zero-custom-token">
            <Font size={14} lineHeight={20} color="two">
              {`0 ${t('customToken')}`}
            </Font>
          </Row>
          <CommonEmpty
            type="nodata"
            desc={
              <>
                <Row className="flex-center-middle">{t('emptyCustomTokens1')}</Row>
                <Row>{t('emptyCustomTokens2')}</Row>
              </>
            }
          />
        </>
      )}
      {customTokenData.tokens.length > 0 && (
        <div className="token-list-container">
          <List
            className="token-list"
            dataSource={customTokenData.tokens}
            locale={{
              emptyText: (
                <CommonEmpty
                  type="nodata"
                  desc={
                    <Col>
                      <Row justify="center">{t('emptyCustomTokens1')}</Row>
                      <Row>{t('emptyCustomTokens2')}</Row>
                    </Col>
                  }
                  size={isMobile ? 'small' : 'large'}
                />
              ),
            }}
            renderItem={(item) => {
              const isAdded = !!addedTokens.find((token) => token.symbol === item.symbol);
              return (
                <List.Item className="token-list-item">
                  <Col span={24} className="manage-token-row">
                    <Row justify="space-between" align="middle">
                      <Row align="middle">
                        <CurrencyLogo size={24} currency={item} />
                        <Col className="token-name">
                          <Row>
                            <Font color="one" size={16} lineHeight={24} weight={'medium'}>
                              {item.symbol}
                            </Font>
                          </Row>
                          <Row>
                            <Font color="two" size={12} lineHeight={18}>{`${item.symbol} Token`}</Font>
                          </Row>
                        </Col>
                      </Row>
                      <Row className="operate-row">
                        <Button
                          type="text"
                          disabled={isAdded}
                          onClick={() => {
                            if (isAdded) return;
                            onClickAddToken(item);
                          }}
                          icon={isAdded ? <IconCheckCircle /> : <IconAddCircle />}
                        />
                      </Row>
                    </Row>
                  </Col>
                </List.Item>
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
