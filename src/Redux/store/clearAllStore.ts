import { persistor } from './store';

export const clearAllStore = async () => {
  await persistor.purge();
  localStorage.removeItem('persist:root');
  localStorage.removeItem('redux-store-version');
};
