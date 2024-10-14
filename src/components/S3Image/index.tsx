import { DetailedHTMLProps, ImgHTMLAttributes, useMemo } from 'react';

export type TS3ImageProps = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
  uri: string;
};

const { REACT_APP_API_ENV } = process.env;
const S3_URL_MAP: Record<string, string> = {
  preview: 'https://awaken-cms-testnet.s3.ap-northeast-1.amazonaws.com',
  test: 'https://awaken-cms-testnet.s3.ap-northeast-1.amazonaws.com',
  mainnet: 'https://awaken-cms-mainnet.s3.ap-northeast-1.amazonaws.com',
};

const S3_URL = S3_URL_MAP[REACT_APP_API_ENV || 'mainnet'] || S3_URL_MAP.mainnet;

export const S3Image = ({ uri, ...props }: TS3ImageProps) => {
  const src = useMemo(() => {
    return `${S3_URL}/${uri}`;
  }, [uri]);

  return <img className="s3-image" {...props} src={src} />;
};
