import { transform, isString, isUndefined, assign, has, get } from 'lodash';
import { Redirect, RedirectProps } from 'react-router-dom';
import { extract, stringify, parse } from 'query-string';

const mergeQueryStrings = (...args: any[]) => {
  const queryString = stringify(
    transform(
      args,
      (result, value) => {
        assign(result, isString(value) ? parse(value) : value);
      },
      {},
    ),
  );
  return queryString ? '?' + queryString : '';
};

export type CustomRedirectProps = {
  preserveQueryString: boolean | undefined;
} & RedirectProps;

export default function CustomRedirect({ preserveQueryString, ...props }: CustomRedirectProps) {
  if (isUndefined(preserveQueryString)) {
    preserveQueryString = has(props, 'from');
  }
  if (!preserveQueryString || !location.search) {
    return <Redirect {...props} />;
  }
  const { to, ...rest } = props;
  const toSearch = isString(to) ? extract(to) : get(to, 'search', '');
  const search = mergeQueryStrings(location.search, toSearch);
  const nextLocation = isString(to) ? { pathname: to.split('?')[0], search } : { ...to, search };
  return <Redirect to={nextLocation} {...rest} />;
}
