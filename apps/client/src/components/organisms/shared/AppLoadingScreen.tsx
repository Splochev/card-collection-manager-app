import { Box, Typography, keyframes } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../stores/store';
import Logo from '../../icons/Logo';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const glow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(197, 157, 57, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(197, 157, 57, 0.8));
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const AppLoadingScreen = ({ label = 'Loading ...' }: { label?: string }) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const isDark = themeMode === 'dark';

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: isDark
          ? 'linear-gradient(135deg, #1c1a17 0%, #26231f 50%, #1c1a17 100%)'
          : 'linear-gradient(135deg, #f8f4e8 0%, #fffdf8 50%, #f8f4e8 100%)',
        gap: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: isDark ? 0.03 : 0.05,
          backgroundImage: `radial-gradient(circle at 25% 25%, ${
            isDark ? '#c59d39' : '#8d6d1f'
          } 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, ${
              isDark ? '#c59d39' : '#8d6d1f'
            } 2px, transparent 2px)`,
          backgroundSize: '50px 50px',
          animation: `${rotate} 60s linear infinite`,
        }}
      />

      {/* Outer glow ring */}
      <Box
        sx={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          border: `2px solid ${isDark ? '#c59d39' : '#8d6d1f'}`,
          opacity: 0.2,
          animation: `${pulse} 3s ease-in-out infinite`,
        }}
      />

      {/* Middle glow ring */}
      <Box
        sx={{
          position: 'absolute',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          border: `2px solid ${isDark ? '#f4d76e' : '#c59d39'}`,
          opacity: 0.3,
          animation: `${pulse} 2.5s ease-in-out infinite 0.3s`,
        }}
      />

      {/* Logo container with glow effect */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          animation: `${glow} 2s ease-in-out infinite`,
        }}
      >
        <Box
          sx={{
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          <Logo size="xlarge" disableClick />
        </Box>
      </Box>

      {/* Loading text with shimmer effect */}
      <Typography
        variant="h5"
        sx={{
          position: 'relative',
          zIndex: 1,
          fontWeight: 600,
          background: isDark
            ? 'linear-gradient(90deg, #c59d39 0%, #f4d76e 25%, #c59d39 50%, #f4d76e 75%, #c59d39 100%)'
            : 'linear-gradient(90deg, #8d6d1f 0%, #c59d39 25%, #8d6d1f 50%, #c59d39 75%, #8d6d1f 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: `${shimmer} 2s linear infinite`,
        }}
      >
        {label}
      </Typography>

      {/* Animated dots */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={`loading-dot-${i}`}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: isDark ? '#c59d39' : '#8d6d1f',
              animation: `${pulse} 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default AppLoadingScreen;
