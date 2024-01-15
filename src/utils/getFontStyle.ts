import clsx from 'clsx';

export type FontWeight = 'regular' | 'medium' | 'bold';

export type FontColor = 'one' | 'two' | 'three' | 'primary' | 'fall' | 'rise' | 'secondary';

export type FontSize = 12 | 14 | 16 | 18 | 20 | 24 | 32;

export type LineHeight = 12 | 14 | 16 | 18 | 20 | 22 | 24 | 26 | 28 | 30 | 36 | 48;

export type Align = 'left' | 'center' | 'right';

export interface FontStyleProps {
  weight?: FontWeight;
  color?: FontColor;
  size?: FontSize;
  lineHeight?: LineHeight;
  align?: Align;
  className?: string;
}

export default function getFontStyle(
  weight: FontWeight = 'regular',
  color: FontColor = 'one',
  size: FontSize = 14,
  lineHeight: number | undefined,
  align: Align = 'left',
): string {
  return clsx(
    `font-weight-${weight}`,
    `font-color-${color}`,
    `font-size-${size}`,
    typeof lineHeight === undefined ? '' : `line-height-${lineHeight}`,
    `text-align-${align}`,
  );
}
