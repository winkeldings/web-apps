import { createContext, useContext, useState } from 'react';
import { readUserPreferences, writeUserPreferences } from '../StorageHelper';

const UserPreferencesContext = createContext(null);

function UserPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(readUserPreferences);

  const updatePreferences = (updates) => {
    setPreferences((currentPreferences) => {
      const nextPreferences = { ...currentPreferences, ...updates };
      writeUserPreferences(nextPreferences);
      return nextPreferences;
    });
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

function useUserPreferences() {
  const context = useContext(UserPreferencesContext);

  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }

  return context;
}

export { UserPreferencesProvider, useUserPreferences };