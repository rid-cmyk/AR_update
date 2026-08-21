import { useState, useEffect, useCallback } from 'react';

export function useFormDraft<T>(storageKey: string, initialValue: T) {
  const [draft, setDraft] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (e) {
      console.error(`Error reading draft from localStorage key "${storageKey}":`, e);
      return initialValue;
    }
  });

  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(storageKey);
      setHasSavedDraft(!!saved);
    }
  }, [storageKey]);

  const saveDraft = useCallback(
    (newVal: T | ((prev: T) => T)) => {
      try {
        const valToStore = newVal instanceof Function ? newVal(draft) : newVal;
        setDraft(valToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(storageKey, JSON.stringify(valToStore));
          setHasSavedDraft(true);
        }
      } catch (e) {
        console.error(`Error saving draft to localStorage key "${storageKey}":`, e);
      }
    },
    [draft, storageKey]
  );

  const clearDraft = useCallback(() => {
    try {
      setDraft(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(storageKey);
        setHasSavedDraft(false);
      }
    } catch (e) {
      console.error(`Error clearing draft key "${storageKey}":`, e);
    }
  }, [initialValue, storageKey]);

  return { draft, saveDraft, clearDraft, hasSavedDraft };
}
