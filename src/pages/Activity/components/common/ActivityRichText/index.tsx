import clsx from 'clsx';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

export type TActivityRichTextProps = {
  className?: string;
  innerHTML: string;
};
export const ActivityRichText = ({ className, innerHTML }: TActivityRichTextProps) => {
  const history = useHistory();
  const onClick = useCallback(
    (event: any) => {
      try {
        if (event.target.tagName.toLowerCase() === 'a') {
          event.preventDefault();
          const link = event.target;
          history.push(link.attributes['href'].value);
        }
      } catch (error) {
        console.log(error, '===err');
      }
    },
    [history],
  );

  return (
    <div
      onClick={onClick}
      className={clsx([['activity-rich-text-wrap', className]])}
      dangerouslySetInnerHTML={{ __html: innerHTML }}
    />
  );
};
