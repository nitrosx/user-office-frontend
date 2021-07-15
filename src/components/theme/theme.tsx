import { createMuiTheme, responsiveFontSizes, Theme } from '@material-ui/core';
import createPalette from '@material-ui/core/styles/createPalette';
import React, { useContext, useEffect } from 'react';

import { SettingsContext } from 'context/SettingsContextProvider';
import { SettingsId } from 'generated/sdk';

type ThemeProps = {
  theme: Theme;
  handleThemeUpdate: (updatedTheme: Theme) => void;
};

const CustomTheme: React.FC<ThemeProps> = (props) => {
  const { settings } = useContext(SettingsContext);
  const currentTheme = props.theme;

  useEffect(() => {
    const palette = createPalette({
      primary: {
        dark:
          settings?.get(SettingsId.PALETTE_PRIMARY_DARK)?.settingsValue ||
          currentTheme.palette.primary.dark,
        main:
          settings.get(SettingsId.PALETTE_PRIMARY_MAIN)?.settingsValue ||
          currentTheme.palette.primary.main,
        light:
          settings.get(SettingsId.PALETTE_PRIMARY_LIGHT)?.settingsValue ||
          currentTheme.palette.primary.light,
      },
      secondary: {
        dark:
          settings.get(SettingsId.PALETTE_SECONDARY_DARK)?.settingsValue ||
          currentTheme.palette.secondary.dark,
        main:
          settings.get(SettingsId.PALETTE_SECONDARY_MAIN)?.settingsValue ||
          currentTheme.palette.secondary.main,
        light:
          settings.get(SettingsId.PALETTE_SECONDARY_LIGHT)?.settingsValue ||
          currentTheme.palette.secondary.light,
      },
      error: {
        main:
          settings.get(SettingsId.PALETTE_ERROR_MAIN)?.settingsValue ||
          currentTheme.palette.error.main,
      },
      success: {
        main:
          settings.get(SettingsId.PALETTE_SUCCESS_MAIN)?.settingsValue ||
          currentTheme.palette.success.main,
      },
      warning: {
        main:
          settings.get(SettingsId.PALETTE_WARNING_MAIN)?.settingsValue ||
          currentTheme.palette.warning.main,
      },
      info: {
        main:
          settings.get(SettingsId.PALETTE_INFO_MAIN)?.settingsValue ||
          currentTheme.palette.info.main,
      },
    });

    const theme = responsiveFontSizes(createMuiTheme(currentTheme, palette));

    props.handleThemeUpdate(theme);

    // Update root CSS variables when settings are changed
    settings.forEach((setting) => {
      if (setting.id.startsWith('PALETTE')) {
        document.documentElement.style.setProperty(
          '--' + setting.id,
          setting.settingsValue
        );
      }
    });
  }, [settings]);

  return <>{props.children}</>;
};

export default CustomTheme;
