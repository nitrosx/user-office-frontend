import {
  createMuiTheme,
  Theme,
  responsiveFontSizes,
} from '@material-ui/core/styles';

const createTheme = (): Theme =>
  responsiveFontSizes(
    createMuiTheme({
      palette: {
        primary: {
          dark: '#b33739',
          main: '#FF4E50',
          light: '#FC913A',
        },
        secondary: {
          dark: '#c7aa1c',
          main: '#F9D423',
          light: '#E1F5C4',
        },
        error: {
          main: '#f44336',
        },
      },
    })
  );

export function getTheme(): Theme {
  return createTheme();
}
