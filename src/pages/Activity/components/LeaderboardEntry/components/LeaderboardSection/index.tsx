import { GradientBorder, TGradientBorderProps } from 'components/GradientBorder';

export type TLeaderboardSectionProps = TGradientBorderProps;

export const LeaderboardSection = ({ children, ...props }: TLeaderboardSectionProps) => {
  return (
    <GradientBorder
      {...props}
      borderColor="linear-gradient(180deg, #747FA0 0%, #2A2E3A 100%)"
      backgroundColor="#121621"
      borderRadius="12px">
      {children}
    </GradientBorder>
  );
};
