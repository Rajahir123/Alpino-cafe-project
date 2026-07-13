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
            if (firebaseUser.email && ['denyteny123@gmail.com', 'yuvraj.gurjar.ai@gmail.com'].includes(firebaseUser.email)) {
              newProfile.role = 'admin';
              newProfile.planStatus = 'active';
              newProfile.planId = 'muscle_gain_pro';
              newProfile.daysRemaining = 30;
              newProfile.phone = 'Admin';
              newProfile.address = 'Admin HQ';
            }
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            const data = userSnap.data() as UserProfile;
            // Force admin for specific email even if document already exists
            if (firebaseUser.email && ['denyteny123@gmail.com', 'yuvraj.gurjar.ai@gmail.com'].includes(firebaseUser.email)) {
              let updates: Partial<UserProfile> = {};
              if (data.role !== 'admin') {
                data.role = 'admin';
                updates.role = 'admin';
              }
              if (!data.phone || !data.address || data.planStatus === 'none' || data.planStatus === 'pending') {
                data.planStatus = 'active';
                data.planId = data.planId || 'muscle_gain_pro';
                data.daysRemaining = Math.max(data.daysRemaining || 0, 30);
                data.phone = data.phone || 'Admin';
                data.address = data.address || 'Admin HQ';
                
                updates.planStatus = data.planStatus;
                updates.planId = data.planId;
                updates.daysRemaining = data.daysRemaining;
                updates.phone = data.phone;
                updates.address = data.address;
              }
              if (Object.keys(updates).length > 0) {
                await setDoc(userRef, updates, { merge: true });
              }
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
