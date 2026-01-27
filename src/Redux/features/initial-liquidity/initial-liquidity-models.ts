import firebase from 'firebase/app';

export interface InitialLiquidity {
  id?: string;
  userId: string;
  monthPeriod: string; // Formato: "YYYY-MM"
  amount: number; // Valor de la liquidez inicial del mes
  isManual: boolean; // true si fue ingresado manualmente, false si fue calculado
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface InitialLiquidityResult {
  liquidity: InitialLiquidity | null;
  calculatedAmount: number;
  wasCalculated: boolean;
}

export interface InitialLiquidityState {
  currentLiquidity: InitialLiquidity | null;
  calculatedAmount: number;
  wasCalculated: boolean;
  history: InitialLiquidity[];
  loading: boolean;
  error: string | null;
}
