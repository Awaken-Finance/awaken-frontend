import { Image, ImageProps } from 'antd';
import { memo, useEffect, useState } from 'react';
import { defaultLogo } from 'assets/images';
import './index.less';
const fallback = defaultLogo;
type LogoProps = {
  size?: number;
  srcs: string[];
  symbol?: string;
};

const BAD_SRCS: { [src: string]: true } = {};

type LogoLoadState = 'loading' | 'success' | 'error';

const Logo = (props: ImageProps & LogoProps) => {
  const { size = 20, preview = false, srcs, symbol } = props;
  const [, refresh] = useState<number>(0);
  const src: string | undefined = srcs.find((s) => !BAD_SRCS[s]);
  const firstLetter = symbol?.charAt(0) || '';
  const [logoState, setLogoState] = useState<LogoLoadState>('loading');

  function FirstLetter() {
    return (
      <div className="first-letter" style={{ width: size, height: size }}>
        {firstLetter}
      </div>
    );
  }

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
    <FirstLetter />
  );
};

export default memo(Logo);
