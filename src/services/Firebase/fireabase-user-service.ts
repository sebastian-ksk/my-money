import { firestore } from '@/config/firebase-config';
import firebase from 'firebase/app';

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  providerId: string;
  createdAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export const userService = {
  async findOrCreateUser(
    user: firebase.User
  ): Promise<Omit<UserData, 'createdAt' | 'updatedAt'>> {
    const userEmail = user.email;
    if (!userEmail) {
      throw new Error('El usuario no tiene email');
    }

    const usersRef = firestore.collection('users');
    const querySnapshot = await usersRef
      .where('email', '==', userEmail)
      .limit(1)
      .get();

    const now = firebase.firestore.Timestamp.now();
    const userData = {
      uid: user.uid,
      email: userEmail,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified,
      providerId: user.providerData[0]?.providerId || 'password',
      updatedAt: now,
    };

    if (querySnapshot.empty) {
      // Usuario no existe, crear nuevo
      await usersRef.doc(user.uid).set({
        ...userData,
        createdAt: now,
      });
    } else {
      // Usuario existe, actualizar datos
      const doc = querySnapshot.docs[0];
      const existingData = doc.data();
      await doc.ref.update({
        ...userData,
        createdAt: existingData.createdAt || now,
      });
    }

    // Retornar sin los timestamps de Firestore para sessionStorage
    return {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      emailVerified: userData.emailVerified,
      providerId: userData.providerId,
    };
  },

  async getUserByEmail(email: string): Promise<UserData | null> {
    const usersRef = firestore.collection('users');
    const querySnapshot = await usersRef
      .where('email', '==', email)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return doc.data() as UserData;
  },
};
