import { Image, ImageProps } from 'antd';
import { memo, useEffect, useMemo, useState } from 'react';
import { defaultLogo } from 'assets/images';
import './index.less';
const fallback = defaultLogo;
type LogoProps = {
  size?: number;
  srcs: string[];
  symbol?: string;
};

const BAD_SRCS: { [src: string]: true } = {};

interface IFirstLetterProps {
  size?: number;
  value?: string;
}
const FirstLetter = ({ size = 20, value }: IFirstLetterProps) => {
  const firstLetter = useMemo(() => value?.charAt(0) || '', [value]);
  const fontSize = useMemo(() => `${Math.floor(size * 0.75)}px`, [size]);

  return (
    <div className="first-letter" style={{ width: size, height: size, fontSize }}>
      {firstLetter}
    </div>
  );
};

type LogoLoadState = 'loading' | 'success' | 'error';
const Logo = (props: ImageProps & LogoProps) => {
  const { size = 20, preview = false, srcs, symbol } = props;
  const [, refresh] = useState<number>(0);
  const src: string | undefined = srcs.find((s) => !BAD_SRCS[s]);
  const [logoState, setLogoState] = useState<LogoLoadState>('loading');

  useEffect(() => {
    if (!src) return;
    const img = document.createElement('img');
    img.src = src;
    img.onload = () => {
      setLogoState('success');
    };
    img.onerror = () => {
      setLogoState('error');
    };
    return () => {
      img.onload = null;
      img.onerror = null;
      setLogoState('loading');
    };
  }, [src]);

  return src && logoState === 'success' ? (
    <Image
      {...props}
      width={size}
      height={size}
      preview={preview}
      src={!src ? fallback : src}
      fallback={fallback}
      onError={() => {
        if (src) BAD_SRCS[src] = true;
        refresh((i) => i + 1);
      }}
    />
  ) : (
    <FirstLetter size={size} value={symbol} />
  );
};

export default memo(Logo);
