import { Button, Switch } from '@base-ui/react';
import { useUserPreferences } from '../../../State/UserPreferences/UserPreferencesContext';

function TitleBar({ app, isAppMenuOpen, onAppMenuToggle }) {
  const { preferences, updatePreferences } = useUserPreferences();
  const isDarkModeSelected = preferences.isDarkModeSelected ?? false;

  const setIsDarkModeSelected = (isSelected) => {
    updatePreferences({ isDarkModeSelected: isSelected });
  };

  return (
    <header className="titleBar">
      <div className="titleGroup">
        <Button
          className="menuToggle"
          aria-label={isAppMenuOpen ? 'App-Menü einklappen' : 'App-Menü ausklappen'}
          aria-expanded={isAppMenuOpen}
          onClick={onAppMenuToggle}
        >
          <span aria-hidden="true">☰</span>
        </Button>
        <span className="appTitle">
          {app.AppName}
          {app.Version && <small>v{app.Version}</small>}
        </span>
      </div>
      <label className="themeControl">
        <span>{isDarkModeSelected ? 'Dark' : 'Light'}</span>
        <Switch.Root
          aria-label="Light- und Dark-Mode umschalten"
          checked={isDarkModeSelected}
          onCheckedChange={setIsDarkModeSelected}
          className="themeSwitch"
        >
          <Switch.Thumb className="switchThumb" />
        </Switch.Root>
      </label>
    </header>
  );
}

export default TitleBar;