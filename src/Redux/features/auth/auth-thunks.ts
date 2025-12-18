import { createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '@/config/firebase';
import { userService } from '@/services/Firebase/fireabase-user-service';
import firebase from 'firebase/app';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const result = await auth.signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
      if (result.user) {
        const userData = await userService.findOrCreateUser(result.user);
        return userData;
      }
      throw new Error('No se pudo obtener información del usuario');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al iniciar sesión');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const result = await auth.createUserWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
      if (result.user) {
        const userData = await userService.findOrCreateUser(result.user);
        return userData;
      }
      throw new Error('No se pudo obtener información del usuario');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al crear la cuenta');
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      if (result.user) {
        const userData = await userService.findOrCreateUser(result.user);
        return userData;
      }
      throw new Error('No se pudo obtener información del usuario');
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Error al iniciar sesión con Google'
      );
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await auth.signOut();
});
