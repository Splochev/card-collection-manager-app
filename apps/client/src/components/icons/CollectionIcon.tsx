import CollectionSvg from '../../assets/collection.svg?react';
import { store } from '../../stores/store';
import { darkTheme, lightTheme } from '../../themes';
import { ICON_SIZE_MAP } from '../../constants';

type IconProps = {
  size?: 'small' | 'medium' | 'large' | number;
  color?: 'inherit' | 'primary' | 'secondary';
};

const CollectionIcon = ({ size = 'small', color }: IconProps) => {
  return (
    <CollectionSvg
      className={
        typeof size === 'string' && ICON_SIZE_MAP[size]
          ? ICON_SIZE_MAP[size]
          : ''
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
