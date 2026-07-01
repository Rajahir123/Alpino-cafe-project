import { useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // New user creation
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              role: 'user',
              planStatus: 'none',
              daysRemaining: 0,
              proteinGoal: 50,
              avgProtein: 0,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            };
            // Special case for initial admin
            if (firebaseUser.email === 'denyteny123@gmail.com') {
              newProfile.role = 'admin';
            }
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            const data = userSnap.data() as UserProfile;
            // Force admin for specific email even if document already exists
            if (firebaseUser.email === 'denyteny123@gmail.com' && data.role !== 'admin') {
              data.role = 'admin';
              await setDoc(userRef, { role: 'admin' }, { merge: true });
            }
            setProfile(data);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
}
