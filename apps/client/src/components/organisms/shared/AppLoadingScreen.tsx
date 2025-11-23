import { Box, Typography, keyframes } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../stores/store';
import Logo from '../../icons/Logo';
import { h5TypographyProps } from './../../../constants';

const STYLES = {
  pulse: keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`,
  glow: keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(197, 157, 57, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(197, 157, 57, 0.8));
  }
`,
  shimmer: keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`,
  rotate: keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`,
};

const AppLoadingScreen = ({ label = 'Loading ...' }: { label?: string }) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  const isDark = themeMode === 'dark';

  const RUNTIME_STYLES = {
    loadingScreenContainer: {
      width: '100vw',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      position: 'relative',
      overflow: 'hidden',
      background: isDark
        ? 'linear-gradient(135deg, #1c1a17 0%, #26231f 50%, #1c1a17 100%)'
        : 'linear-gradient(135deg, #f8f4e8 0%, #fffdf8 50%, #f8f4e8 100%)',
    },
    animatedBgPattern: {
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
      animation: `${STYLES.rotate} 60s linear infinite`,
    },
    outerGlowRingBox: {
      position: 'absolute',
      width: '280px',
      height: '280px',
      borderRadius: '50%',
      border: `2px solid ${isDark ? '#c59d39' : '#8d6d1f'}`,
      opacity: 0.2,
      animation: `${STYLES.pulse} 3s ease-in-out infinite`,
    },
    middleGlowRingBox: {
      position: 'absolute',
      width: '220px',
      height: '220px',
      borderRadius: '50%',
      border: `2px solid ${isDark ? '#f4d76e' : '#c59d39'}`,
      opacity: 0.3,
      animation: `${STYLES.pulse} 2.5s ease-in-out infinite 0.3s`,
    },
    logoContainerWithGlowEffect: {
      position: 'relative',
      zIndex: 1,
      animation: `${STYLES.glow} 2s ease-in-out infinite`,
    },
    logoWrapper: {
      animation: `${STYLES.pulse} 2s ease-in-out infinite`,
    },
    textWithShimmerEffect: {
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
      animation: `${STYLES.shimmer} 2s linear infinite`,
    },
    animatedDotsBox: {
      display: 'flex',
      gap: 1,
      position: 'relative',
      zIndex: 1,
    },
    animatedDot: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: isDark ? '#c59d39' : '#8d6d1f',
      animation: `${STYLES.pulse} 1.4s ease-in-out infinite`,
    },
  };

  return (
    <Box sx={RUNTIME_STYLES.loadingScreenContainer}>
      <Box sx={RUNTIME_STYLES.animatedBgPattern} />
      <Box sx={RUNTIME_STYLES.outerGlowRingBox} />
      <Box sx={RUNTIME_STYLES.middleGlowRingBox} />
      <Box sx={RUNTIME_STYLES.logoContainerWithGlowEffect}>
        <Box sx={RUNTIME_STYLES.logoWrapper}>
          <Logo size="xlarge" disableClick />
        </Box>
      </Box>
      <Typography
        {...h5TypographyProps}
        sx={RUNTIME_STYLES.textWithShimmerEffect}
      >
        {label}
      </Typography>
      <Box sx={RUNTIME_STYLES.animatedDotsBox}>
        {[0, 1, 2].map((i) => (
          <Box
            key={`loading-dot-${i}`}
            sx={{
              ...RUNTIME_STYLES.animatedDot,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default AppLoadingScreen;
