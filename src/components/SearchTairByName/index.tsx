import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SearchInput from 'components/SearchInput';

interface SearchTairByNameProps {
  defaultValue?: string;
  onChange?: (val: string) => void;
  dely?: number;
  placeholder?: string;
  className?: string;
  value?: string;
}

export default function SearchTairByName({
  defaultValue = '',
  onChange = () => null,
  placeholder = 'search',
  className = '',
  value,
}: SearchTairByNameProps) {
  const { t } = useTranslation();
  const [searchVal, setSearchVal] = useState<string | undefined>(defaultValue);

  const searchValChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const value = e.target.value.trim();
      onChange && onChange(value);
      setSearchVal(value);
    },
    [onChange],
  );

  useEffect(() => {
    if (typeof value === undefined || value === searchVal) {
      return;
    }
    setSearchVal(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <SearchInput
      allowClear
      placeholder={t(placeholder)}
      onChange={searchValChange}
      value={searchVal}
      className={className}
    />
  );
}
