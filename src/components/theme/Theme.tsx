import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React from 'react';
import { getTheme } from 'theme';

const Theme: React.FC = (props) => {
  return (
    <>
      <ThemeProvider theme={getTheme()}>{props.children}</ThemeProvider>
    </>
  );
};

export default Theme;
