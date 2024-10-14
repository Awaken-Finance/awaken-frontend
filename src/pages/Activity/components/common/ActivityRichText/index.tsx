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
          const href = link.attributes['href'].value;

          if (!href.startsWith('http')) {
            history.push(href);
            return;
          }
          window.open(href, link?.attributes?.['target']?.value || '_self');
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
