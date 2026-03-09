import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00A76F' },
    secondary: { main: '#8E33FF' },
    warning: { main: '#FFC107' },
    error: { main: '#FF5630' },
    info: { main: '#00B8D9' },
    background: {
      default: '#161C24',
      paper: '#212B36',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#919EAB',
    },
  },
  typography: {
    fontFamily: '"Public Sans", "Inter", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 0 2px 0 rgba(0,0,0,0.2), 0 12px 24px -4px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
