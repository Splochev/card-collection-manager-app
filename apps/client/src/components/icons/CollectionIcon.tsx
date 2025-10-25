// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CollectionSvg from '../../assets/collection.svg?react';
import { store } from '../../stores/store';
import { darkTheme, lightTheme } from '../../themes';

const SIZE_MAP = {
  small: 'h-8',
  medium: 'h-10',
  large: 'h-12',
};

type IconProps = {
  size?: 'small' | 'medium' | 'large' | number;
  color?: 'inherit' | 'primary' | 'secondary';
};

const CollectionIcon = ({ size = 'small', color }: IconProps) => {
  return (
    <CollectionSvg
      className={
        typeof size === 'string' && SIZE_MAP[size] ? SIZE_MAP[size] : ''
      }
      style={{
        fill: 'currentColor',
        width: typeof size === 'number' ? size : undefined,
        height: typeof size === 'number' ? size : undefined,
        paddingTop: typeof size === 'number' ? '8px' : undefined,
        color: color
          ? color
          : store.getState().theme.mode === 'light'
          ? lightTheme.palette.primary.main
          : darkTheme.palette.primary.main,
      }}
    />
  );
};

export default CollectionIcon;
