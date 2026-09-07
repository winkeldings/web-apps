import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apps, homeApp } from '../Apps/Apps';
import { useUserPreferences } from '../State/UserPreferences/UserPreferencesContext';
import AppMenu from './Components/AppMenu/AppMenu';
import TitleBar from './Components/TitleBar/TitleBar';
import './Wireframe.css';

function findAppByPath(pathname) {
  const normalizedPath = pathname.replace(/\/$/, '') || '/';
  return apps.find((app) => app.AppUrl === normalizedPath) || homeApp;
}

function Wireframe() {
  const location = useLocation();
  const navigate = useNavigate();
  const { preferences } = useUserPreferences();

  const [isAppMenuOpen, setIsAppMenuOpen] = useState(true);
  const isDarkModeSelected = preferences.isDarkModeSelected ?? false;
  
  const selectedApp = findAppByPath(location.pathname);

  const selectApp = (app) => {
    if (location.pathname !== app.AppUrl) {
      navigate(app.AppUrl);
    }
  };

  const ActiveApp = selectedApp.Component;

  return (
    <div className={`wireframe ${isDarkModeSelected ? 'dark' : ''} ${isAppMenuOpen ? '' : 'menuCollapsed'}`}>
      <TitleBar
        app={selectedApp}
        isAppMenuOpen={isAppMenuOpen}
        onAppMenuToggle={() => setIsAppMenuOpen((isOpen) => !isOpen)}
      />

      <div className="layout">
        <AppMenu
          selectedApp={selectedApp}
          onAppSelect={selectApp}
        />

        <main className="content">
          <section className="appSurface" aria-label={`${selectedApp.AppName}`}>
            <ActiveApp />
          </section>
        </main>
      </div>
    </div>
  );
}

export default Wireframe;