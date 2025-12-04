import clsx from 'clsx';
import './styles.less';
import Font, { FontProps } from 'components/Font';
import { IconArrowRight2 } from 'assets/icons';
import { TGetSvgStyleParams, getSvgStyle } from 'utils/getFontStyle';

export type TCommonLinkProps = FontProps & {
  className?: string;
  iconProps?: TGetSvgStyleParams;
  onClick?: () => void;
};

export default function CommonLink({ className, iconProps, onClick, ...props }: TCommonLinkProps) {
  return (
    <div className={clsx('common-link', className)} onClick={onClick}>
      <Font {...props} />
      <IconArrowRight2 className={getSvgStyle({ ...iconProps })} />
    </div>
  );
}
