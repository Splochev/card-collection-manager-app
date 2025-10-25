import logo from '../../assets/logo.png';
import { useNavigate, useLocation } from 'react-router-dom';

const SIZE_MAP = {
  small: 'h-8',
  medium: 'h-10',
  large: 'h-12',
  xlarge: 'h-24',
};

type LogoProps = {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  disableClick?: boolean;
};

const Logo = ({ size = 'small', disableClick = false }: LogoProps) => {
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
      window.location.reload();
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
        className={SIZE_MAP[size]}
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
