import { BrowserRouter } from 'react-router-dom';
import { UserPreferencesProvider } from './State/UserPreferences/UserPreferencesContext';
import Wireframe from './Wireframe/Wireframe';

function WebApps() {
  const basename = import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <UserPreferencesProvider>
      <BrowserRouter basename={basename}>
        <Wireframe />
      </BrowserRouter>
    </UserPreferencesProvider>
  );
}

export default WebApps;