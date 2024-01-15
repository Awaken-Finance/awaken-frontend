import { Slider, SliderSingleProps } from 'antd';
import type { SliderMarks } from 'antd/es/slider';

import Font from 'components/Font';

import './index.less';
import { useCallback } from 'react';
import clsx from 'clsx';

const marks: SliderMarks = {
  0: (
    <Font size={12} lineHeight={18} color="three">
      0
    </Font>
  ),
  25: (
    <Font size={12} lineHeight={18} color="three">
      25%
    </Font>
  ),
  50: (
    <Font size={12} lineHeight={18} color="three">
      50%
    </Font>
  ),
  75: (
    <Font size={12} lineHeight={18} color="three">
      75%
    </Font>
  ),
  100: (
    <Font size={12} lineHeight={18} color="three">
      100%
    </Font>
  ),
};

function CommonSlider({ onChange = () => null, min = 0, max = 100, className, ...props }: SliderSingleProps) {
  const handleAfterChange = useCallback(
    (val) => {
      if (val === min) {
        onChange(val);
      }
    },
    [onChange, min],
  );

  return (
    <Slider
      onChange={onChange}
      onAfterChange={handleAfterChange}
      max={max}
      min={min}
      marks={marks}
      className={clsx('common-slider', className)}
      tipFormatter={(v) => `${v}%`}
      getTooltipPopupContainer={(triggerNode: { parentNode: any }) => triggerNode.parentNode}
      {...props}
    />
  );
}

export default CommonSlider;
