import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2D7FF9', // Energetic Blue
      light: '#63A4FF',
      dark: '#005DC7',
    },
    secondary: {
      main: '#FF5C8D', // Youthful Pink/Coral
      light: '#FF91AE',
      dark: '#C7245F',
    },
    background: {
      default: '#F4F7FA',
      paper: '#FFFFFF',
    },
    success: {
      main: '#00C853', // Lively Green
    },
    warning: {
      main: '#FFAB00', // Vibrant Orange
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12, // More rounded, friendly look
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(45, 127, 249, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 8px 24px rgba(149, 157, 165, 0.1)',
          border: '1px solid #E1E8ED',
        },
      },
    },
  },
});
