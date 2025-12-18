'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setUser } from '../features/auth/auth-slice';
import { auth } from '@/config/firebase';
import { userService } from '@/services/Firebase/fireabase-user-service';
import firebase from 'firebase/app';

export default function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log('AuthListener montado, configurando listener de Firebase Auth');

    // Escuchar cambios en el estado de autenticación de Firebase
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log(
        'Firebase Auth state changed:',
        firebaseUser ? 'Usuario autenticado' : 'Usuario no autenticado'
      );

      if (firebaseUser) {
        try {
          console.log('Obteniendo datos del usuario desde Firestore...');
          // Obtener o crear el usuario en Firestore
          const userData = await userService.findOrCreateUser(firebaseUser);
          console.log('Usuario obtenido, actualizando Redux:', userData);
          // Actualizar Redux con el usuario
          dispatch(setUser(userData));
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          dispatch(setUser(null));
        }
      } else {
        // Usuario no autenticado
        console.log('Usuario no autenticado, limpiando Redux');
        dispatch(setUser(null));
      }
    });

    // Cleanup
    return () => {
      console.log('AuthListener desmontado, limpiando listener');
      unsubscribe();
    };
  }, [dispatch]);

  return null;
}
