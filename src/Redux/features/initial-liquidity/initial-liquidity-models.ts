import firebase from 'firebase/app';

// Solo puede existir UN documento por usuario por mes (clave: userId_monthPeriod)
export interface InitialLiquidity {
  id?: string; // Formato: userId_monthPeriod (ej: "abc123_2026-01")
  userId: string;
  monthPeriod: string; // Formato: "YYYY-MM"
  realAmount: number | null; // Valor ingresado manualmente por el usuario
  calculatedAmount: number; // Valor calculado automáticamente
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface InitialLiquidityResult {
  liquidity: InitialLiquidity | null;
  effectiveAmount: number; // realAmount si existe, sino calculatedAmount
  wasCalculated: boolean; // true si se usa el calculatedAmount (no hay realAmount)
}

export interface InitialLiquidityState {
  currentLiquidity: InitialLiquidity | null;
  effectiveAmount: number; // El valor que se usa (real o calculado)
  wasCalculated: boolean; // true si se usa el calculatedAmount
  history: InitialLiquidity[];
  loading: boolean;
  error: string | null;
}
