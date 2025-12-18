import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { autoMigrationMiddleware } from '../middleware/autoMigrationMiddleware';

// Importar reducers de features
import { authReducer } from '../features/auth';
import { userReducer } from '../features/user';
import { configMyMoneyReducer } from '../features/config-my-money';

// Combinar reducers por dominio
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  configMyMoney: configMyMoneyReducer,
  // Agregar más features aquí
});

// Configuración de persistencia
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: [
    'auth',
    'user',
    // Agregar dominios a persistir aquí
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configurar store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(autoMigrationMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Tipos para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
