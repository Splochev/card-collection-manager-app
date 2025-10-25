import { createTheme, type ThemeOptions } from '@mui/material/styles';

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#c59d39',
      light: '#f4d76e',
      dark: '#8d6d1f',
      contrastText: '#1c1a17',
    },
    secondary: {
      main: '#2b8e8a',
      light: '#5ed1cd',
      dark: '#1a605d',
      contrastText: '#ffffff',
    },
    background: {
      default: '#1c1a17',
      paper: '#26231f',
    },
    text: {
      primary: '#f4e7cf',
      secondary: '#c7b9a1',
      disabled: '#7d7264',
      //   hint: "#a99c88",
    },
    error: {
      main: '#d64550',
      light: '#ff7b82',
      dark: '#991d25',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f2a541',
      light: '#ffd46e',
      dark: '#b3711b',
      contrastText: '#1c1a17',
    },
    success: {
      main: '#4e9a51',
      light: '#82d884',
      dark: '#276b2a',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3c78d8',
      light: '#76a9ff',
      dark: '#234d91',
      contrastText: '#ffffff',
    },
    divider: '#3a342c',
  },
};

const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#c59d39',
      light: '#f4d76e',
      dark: '#8d6d1f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2b8e8a',
      light: '#5ed1cd',
      dark: '#1a605d',
      contrastText: '#ffffff',
    },
    text: {
      //   hint: "#8c7b6f",
      primary: '#3b2f2f',
      secondary: '#6b5e5e',
      disabled: '#b3a9a0',
    },
    background: {
      default: '#f8f4e8',
      paper: '#fffdf8',
    },
    error: {
      main: '#d64550',
      light: '#ff7b82',
      dark: '#991d25',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f2a541',
      light: '#ffd46e',
      dark: '#b3711b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4e9a51',
      light: '#82d884',
      dark: '#276b2a',
      contrastText: '#ffffff',
    },
    divider: '#ddd1b8',
  },
};

const lightTheme = createTheme(lightThemeOptions);
const darkTheme = createTheme(darkThemeOptions);

export { lightTheme, darkTheme };
