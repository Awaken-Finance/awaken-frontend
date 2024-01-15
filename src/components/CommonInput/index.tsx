import { Ref, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Input, InputProps, InputRef } from 'antd';
import { IconClearInput } from 'assets/icons';
import clsx from 'clsx';
import { useMobile } from 'utils/isMobile';

import './index.less';

let blurTimer: any = null;

export interface CommonInputProps extends InputProps {
  textAlign?: 'left' | 'center' | 'right';
  resumePositionOnBlur?: boolean;
  inputRef?: Ref<InputRef>;
}

export default forwardRef(function CommonInput(
  {
    textAlign = 'left',
    className,
    value = '',
    allowClear,
    resumePositionOnBlur = false,
    onFocus,
    onBlur,
    maxLength = 100,
    ...props
  }: CommonInputProps,
  ref,
) {
  const isMobile = useMobile();
  const [scrollY, setScrollY] = useState(0);

  const inputEle = useRef<InputRef>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputEle.current?.focus();
    },
  }));

  const onFocusInternal = (e: any) => {
    if (blurTimer) {
      clearTimeout(blurTimer);
      blurTimer = null;
    }
    setScrollY(window.scrollY);
    onFocus?.(e);
  };
  const onBlurInternal = (e: any) => {
    onBlur?.(e);
    if (isMobile && resumePositionOnBlur) {
      blurTimer = setTimeout(() => {
        blurTimer = 0;
        try {
          window.scrollTo({
            top: scrollY,
            left: window.scrollX,
            behavior: 'smooth',
          });
        } catch (error) {
          console.warn(error);
        }
      }, 50);
    }
  };

  const handleFocus = () => {
    inputEle?.current?.focus();
  };

  const renderClear = useMemo(() => {
    if (!allowClear) {
      return false;
    }

    if (typeof allowClear === 'boolean') {
      return { clearIcon: <IconClearInput style={{ display: 'flex' }} /> };
    }

    return allowClear;
  }, [allowClear]);

  const style = useMemo(() => {
    return clsx(
      'common-input',
      {
        'common-input-center': textAlign === 'center',
        'common-input-right': textAlign === 'right',
      },
      className,
    );
  }, [className, textAlign]);

  return (
    <span onClick={handleFocus}>
      <Input
        className={style}
        maxLength={maxLength}
        {...props}
        onFocus={onFocusInternal}
        onBlur={onBlurInternal}
        value={value}
        max={100}
        allowClear={renderClear}
        ref={inputEle}
      />
    </span>
  );
});
