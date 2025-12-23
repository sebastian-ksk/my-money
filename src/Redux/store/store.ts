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
import { myMonthReducer } from '../features/my-month';

// Combinar reducers por dominio
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  configMyMoney: configMyMoneyReducer,
  myMonth: myMonthReducer,
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
        ignoredActionPaths: [
          'payload.createdAt',
          'payload.updatedAt',
          'payload.date',
          'meta.arg.transaction.date',
          'meta.arg.transaction.createdAt',
          'meta.arg.transaction.updatedAt',
        ],
        ignoredPaths: [
          'myMonth.transactions',
          'myMonth.monthlyLiquidity',
          'configMyMoney.savingsSources',
          'configMyMoney.balanceSources',
          'configMyMoney.fixedExpenses',
          'configMyMoney.expectedIncomes',
        ],
      },
    }).concat(autoMigrationMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Exportar tipos
export type { AppStore, RootState, AppDispatch } from './types';
