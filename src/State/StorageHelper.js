const WEB_APPS_STORAGE_PREFIX = 'web-apps';
const USER_PREFERENCES_STORAGE_KEY = `${WEB_APPS_STORAGE_PREFIX}:user-preferences`;

function readStorageValue(storageKey, fallbackValue) {
  try {
    const storedValue = window.localStorage.getItem(storageKey);
    return storedValue ? JSON.parse(storedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeStorageValue(storageKey, value) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
  }
}

function removeStorageValue(storageKey) {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
  }
}

function readUserPreferences() {
  return readStorageValue(USER_PREFERENCES_STORAGE_KEY, {});
}

function writeUserPreferences(preferences) {
  writeStorageValue(USER_PREFERENCES_STORAGE_KEY, preferences);
}

function readAppData(appId) {
  return readStorageValue(`${WEB_APPS_STORAGE_PREFIX}:${appId}`, {});
}

function writeAppData(appId, data) {
  writeStorageValue(`${WEB_APPS_STORAGE_PREFIX}:${appId}`, data);
}

function removeAppData(appId) {
  removeStorageValue(`${WEB_APPS_STORAGE_PREFIX}:${appId}`);
}

export {
  WEB_APPS_STORAGE_PREFIX,
  readAppData,
  readUserPreferences,
  removeAppData,
  writeAppData,
  writeUserPreferences,
};