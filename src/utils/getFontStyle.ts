import clsx from 'clsx';

export type FontWeight = 'regular' | 'medium' | 'bold';

export type FontColor = 'one' | 'two' | 'three' | 'primary' | 'fall' | 'rise' | 'secondary';
// one: --ant-black-font-color-1 #E5E8EF
// two: --ant-black-font-color-2 #9BA0B0
// three: --ant-black-font-color-3 #5C6170
// primary: --ant-primary-font-color #5685FF
// fall: --ant-fall-font-color #FF496A
// rise: --ant-rise-font-color #2AED9B
// secondary: --ant-secondary-color #FFC736

export type FontSize = 10 | 12 | 14 | 16 | 18 | 20 | 22 | 24 | 32 | 40;

export type LineHeight = 12 | 14 | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 32 | 36 | 40 | 48;

export type Align = 'left' | 'center' | 'right';

export interface FontStyleProps {
  weight?: FontWeight;
  color?: FontColor;
  size?: FontSize;
  lineHeight?: LineHeight;
  align?: Align;
  className?: string;
}

export default function getFontStyle({
  weight = 'regular',
  color = 'one',
  size = 14,
  lineHeight,
  align = 'left',
}: Omit<FontStyleProps, 'classname'>): string {
  return clsx(
    `font-weight-${weight}`,
    `font-color-${color}`,
    `font-size-${size}`,
    typeof lineHeight === undefined ? '' : `line-height-${lineHeight}`,
    `text-align-${align}`,
  );
}

export type TSvgSize = 16 | 20;
export type TSvgColor = 'one' | 'two';
// one: --ant-black-font-color-1 #E5E8EF
// two: --ant-black-font-color-2 #9BA0B0

export type TGetSvgStyleParams = {
  size?: TSvgSize;
  color?: TSvgColor;
};
export const getSvgStyle = ({ size = 20, color = 'one' }: TGetSvgStyleParams) => {
  return clsx(`svg-size-${size}`, `svg-color-${color}`);
};
