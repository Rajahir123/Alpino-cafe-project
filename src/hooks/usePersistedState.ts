import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';

export function usePersistedState<T>(panelId: string, initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const isInitialMount = useRef(true);

  // Load initial data from Firebase
  useEffect(() => {
    if (!user) {
      // Fallback to local storage for guests
      const saved = localStorage.getItem(`draft_${panelId}`);
      if (saved) {
        try {
          setState(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing local draft", e);
        }
      }
      setLoading(false);
      return;
    }

    const draftRef = doc(db, 'users', user.uid, 'drafts', panelId);
    
    const unsubscribe = onSnapshot(draftRef, (docSnap) => {
      if (docSnap.exists() && isInitialMount.current) {
        setState(docSnap.data().data as T);
      }
      setLoading(false);
      isInitialMount.current = false;
    });

    return () => unsubscribe();
  }, [user, panelId]);

  // Save data to Firebase (debounced)
  useEffect(() => {
    if (loading || isInitialMount.current) return;

    const timeout = setTimeout(async () => {
      if (user) {
        const draftRef = doc(db, 'users', user.uid, 'drafts', panelId);
        await setDoc(draftRef, {
          panelId,
          data: state,
          updatedAt: Timestamp.now()
        });
      } else {
        localStorage.setItem(`draft_${panelId}`, JSON.stringify(state));
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [state, user, panelId, loading]);

  return [state, setState, loading] as const;
}
