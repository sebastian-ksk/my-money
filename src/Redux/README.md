# Redux Store Configuration

## Estructura

```
src/Redux/
├── store/
│   ├── store.ts          # Store principal con Redux Toolkit
│   ├── hooks.ts          # Hooks tipados (useAppDispatch, useAppSelector)
│   ├── clearAllStore.ts  # Función para limpiar el store
│   └── index.ts          # Exports centralizados
├── features/             # Features organizados por dominio
│   ├── auth/            # Autenticación
│   │   ├── auth-slice.ts
│   │   ├── auth-thunks.ts
│   │   ├── auth-selectors.ts
│   │   └── index.ts
│   └── user/            # Usuario
│       ├── user-slice.ts
│       ├── user-selectors.ts
│       └── index.ts
├── middleware/
│   └── autoMigrationMiddleware.ts  # Middleware de migración
├── providers/
│   └── ReduxProvider.tsx  # Provider de Redux
└── types/
    └── index.ts          # Tipos TypeScript
```

## Uso

### En un componente

```tsx
'use client';

import { useAppDispatch, useAppSelector } from '@/Redux/store/hooks';
import { loginUser } from '@/Redux/features/auth/auth-thunks';
import { selectIsAuthenticated, selectUser } from '@/Redux/features/auth/auth-selectors';

export default function MyComponent() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const handleLogin = async () => {
    const result = await dispatch(loginUser({
      email: 'user@example.com',
      password: 'password'
    }));

    if (loginUser.fulfilled.match(result)) {
      // Login exitoso
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user?.email}</p>
      ) : (
        <button onClick={handleLogin}>Iniciar Sesión</button>
      )}
    </div>
  );
}
```

### Crear un nuevo feature

1. Crear la estructura en `src/Redux/features/feature-name/`
2. Crear el slice con `createSlice`
3. Crear thunks con `createAsyncThunk` (si hay acciones async)
4. Crear selectores memoizados
5. Exportar todo en `index.ts`
6. Agregar el reducer en `store.ts`

### Limpiar el store

```tsx
import { clearAllStore } from '@/Redux/store/clearAllStore';

await clearAllStore();
```
