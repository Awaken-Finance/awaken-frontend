import CommonInput, { CommonInputProps } from 'components/CommonInput';

import { IconSearch } from 'assets/icons';

export default function SearchInput({ placeholder = 'Search', ...props }: CommonInputProps) {
  return <CommonInput placeholder={placeholder} prefix={<IconSearch />} allowClear {...props} />;
}
