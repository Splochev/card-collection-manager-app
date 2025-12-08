import logo from '../../assets/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { ICON_SIZE_MAP } from '../../constants';
import type { IconProps } from '@card-collection-manager-app/shared';

const Logo = ({ size = 'small', disableClick = false }: IconProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = '/' + location.pathname.split('/')[1];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disableClick) {
      e.preventDefault();
      return;
    }
    if (e.button === 0 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      navigate(basePath);
    }
  };

  return (
    <a
      href={basePath}
      onClick={handleClick}
      style={{
        cursor: disableClick ? 'default' : 'pointer',
        display: 'inline-block',
      }}
    >
      <img
        src={logo}
        alt="Logo"
        className={
          ICON_SIZE_MAP[
            typeof size === 'string' && size in ICON_SIZE_MAP
              ? (size as keyof typeof ICON_SIZE_MAP)
              : 'small'
          ]
        }
        style={{
          transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
        }}
        onMouseEnter={(e) => {
          if (disableClick) return;
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          if (disableClick) return;
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />
    </a>
  );
};

export default Logo;
