import { useEffect, useRef, useState } from 'react';
import type { UseFormReturnType } from '@mantine/form';

interface UseFormAutoSaveOptions<T> {
  debounceMs?: number;
  onRestore?: (data: T) => void;
  onSave?: (data: T) => void;
}

interface UseFormAutoSaveReturn {
  isDirty: boolean;
  clear: () => void;
}

export function useFormAutoSave<T extends Record<string, any>>(
  form: UseFormReturnType<T>,
  storageKey: string,
  options: UseFormAutoSaveOptions<T> = {}
): UseFormAutoSaveReturn {
  const { debounceMs = 1000, onRestore, onSave } = options;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedDataRef = useRef<T | null>(null);
  const initialValuesRef = useRef<T | null>(null);
  const initialDataRef = useRef<T | null>(null);

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData) as T;
        form.setValues(() => parsedData);
        lastSavedDataRef.current = parsedData;
        onRestore?.(parsedData);
      }
    } catch (error) {
      console.warn(`Failed to restore form data from ${storageKey}:`, error);
    }
  }, [form, storageKey, onRestore]);

  useEffect(() => {
    const currentData = form.values;
    const lastSaved = lastSavedDataRef.current;
    const initialValues = initialValuesRef.current;

    if (
      !lastSaved ||
      JSON.stringify(currentData) === JSON.stringify(lastSaved) ||
      JSON.stringify(currentData) === JSON.stringify(initialValues)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDirty(false);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDirty(true);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(currentData));
        lastSavedDataRef.current = currentData;
        setIsDirty(false);
        onSave?.(currentData);
      } catch (error) {
        console.warn(`Failed to save form data to ${storageKey}:`, error);
      }
    }, debounceMs);
  }, [form.values, storageKey, debounceMs, onSave]);

  useEffect(() => {
    if (initialDataRef.current === null && lastSavedDataRef.current === null) {
      initialDataRef.current = { ...form.values };
    }
  }, [form.values]);

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    localStorage.removeItem(storageKey);
    lastSavedDataRef.current = null;
    setIsDirty(false);
  };

  return { isDirty, clear };
}
