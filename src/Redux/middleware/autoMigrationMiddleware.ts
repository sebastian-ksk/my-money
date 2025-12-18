import { Middleware } from '@reduxjs/toolkit';

const STORE_VERSION_KEY = 'redux-store-version';
const CURRENT_STORE_VERSION = '1.0.0';

interface MigrationState {
  _persist?: {
    version?: string;
  };
}

export const autoMigrationMiddleware: Middleware =
  (store) => (next) => (action) => {
    // Solo ejecutar una vez por sesión
    if (typeof window === 'undefined') {
      return next(action);
    }

    const sessionKey = 'migration-checked';
    if (sessionStorage.getItem(sessionKey)) {
      return next(action);
    }

    try {
      const persistedState = localStorage.getItem('persist:root');
      if (!persistedState) {
        sessionStorage.setItem(sessionKey, 'true');
        return next(action);
      }

      const parsed = JSON.parse(persistedState);
      const storedVersion =
        parsed._persist?.version || localStorage.getItem(STORE_VERSION_KEY);

      // Si hay cambio de versión o estructura incompatible, limpiar
      if (storedVersion !== CURRENT_STORE_VERSION) {
        console.warn(
          `Store version mismatch. Expected ${CURRENT_STORE_VERSION}, found ${storedVersion}. Clearing store.`
        );
        localStorage.removeItem('persist:root');
        localStorage.setItem(STORE_VERSION_KEY, CURRENT_STORE_VERSION);
      }

      // Validar estructura básica del estado
      const state = store.getState();
      if (!state || typeof state !== 'object') {
        console.warn('Invalid store structure detected. Clearing store.');
        localStorage.removeItem('persist:root');
      }
    } catch (error) {
      console.error('Error during store migration:', error);
      localStorage.removeItem('persist:root');
    }

    sessionStorage.setItem(sessionKey, 'true');
    return next(action);
  };
