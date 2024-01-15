import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import useLoginCheck from 'hooks/useLoginCheck';
import { MouseEvent } from 'react';

export default function AuthBtn({
  onClick,
  onGotoLogin,
  ...props
}: CommonButtonProps & {
  onGotoLogin?: () => void;
}) {
  const onClickWithAuth = useLoginCheck<MouseEvent<HTMLElement>>(
    {
      checkAccountSync: true,
    },
    (e) => {
      onClick && onClick(e);
    },
    onGotoLogin,
  );

  return <CommonButton {...props} onClick={onClickWithAuth} />;
}
