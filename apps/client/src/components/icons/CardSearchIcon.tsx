// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CardSearchSvg from '../../assets/card-search.svg?react';
import { store } from '../../stores/store';
import { darkTheme, lightTheme } from '../../themes';

const SIZE_MAP = {
  small: 'h-8',
  medium: 'h-10',
  large: 'h-12',
};

type IconProps = {
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'primary' | 'secondary';
};

const CardSearchIcon = ({ size = 'small', color }: IconProps) => {
  return (
    <CardSearchSvg
      className={SIZE_MAP[size]}
      style={{
        fill: 'currentColor',
        color: color
          ? color
          : store.getState().theme.mode === 'light'
          ? lightTheme.palette.primary.main
          : darkTheme.palette.primary.main,
      }}
    />
  );
};

export default CardSearchIcon;
