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
import { dashboardReducer } from '../features/dashboard';
import { initialLiquidityReducer } from '../features/initial-liquidity';

// Combinar reducers por dominio
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  configMyMoney: configMyMoneyReducer,
  myMonth: myMonthReducer,
  dashboard: dashboardReducer,
  initialLiquidity: initialLiquidityReducer,
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
          'configMyMoney.userConfig',
          'configMyMoney.savingsSources',
          'configMyMoney.balanceSources',
          'configMyMoney.fixedExpenses',
          'configMyMoney.expectedIncomes',
          'configMyMoney.expenseCategories',
          'initialLiquidity.currentLiquidity',
          'initialLiquidity.history',
        ],
        isSerializable: (value: any, path?: string) => {
          // Ignorar paths que contengan createdAt o updatedAt (son Timestamps de Firebase)
          if (
            path &&
            (path.includes('createdAt') || path.includes('updatedAt'))
          ) {
            return true;
          }
          // Permitir Timestamps de Firebase
          if (value && typeof value === 'object' && value.constructor) {
            if (value.constructor.name === 'Timestamp') {
              return true;
            }
            // Verificar si es un Timestamp de Firebase por sus propiedades
            if (
              value.seconds !== undefined &&
              value.nanoseconds !== undefined &&
              typeof value.toDate === 'function'
            ) {
              return true;
            }
          }
          // Verificación básica para otros valores primitivos
          if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null ||
            value === undefined
          ) {
            return true;
          }
          // Para objetos y arrays, permitirlos (la verificación profunda se hace recursivamente)
          return true;
        },
      },
    }).concat(autoMigrationMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Exportar tipos
export type { AppStore, RootState, AppDispatch } from './types';
