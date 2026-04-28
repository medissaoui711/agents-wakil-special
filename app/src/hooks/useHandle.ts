import { useState, useCallback } from 'react';
import { api, HandleCheckResponse, HandleReserveResponse, HandleResponse } from '@/lib/api';

interface UseHandleReturn {
  // State
  handle: string;
  setHandle: (value: string) => void;
  isChecking: boolean;
  isReserving: boolean;
  isClaiming: boolean;
  availability: HandleCheckResponse | null;
  reservation: HandleReserveResponse | null;
  error: string | null;
  
  // Actions
  checkAvailability: () => Promise<void>;
  reserveHandle: (email: string) => Promise<void>;
  claimHandle: (email: string, password: string) => Promise<HandleResponse | null>;
  reset: () => void;
}

export function useHandle(): UseHandleReturn {
  const [handle, setHandle] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [availability, setAvailability] = useState<HandleCheckResponse | null>(null);
  const [reservation, setReservation] = useState<HandleReserveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async () => {
    if (!handle || handle.length < 3) {
      setError('العنوان يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const result = await api.checkHandle(handle);
      setAvailability(result);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في التحقق');
    } finally {
      setIsChecking(false);
    }
  }, [handle]);

  const reserveHandle = useCallback(async (email: string) => {
    if (!handle) return;

    setIsReserving(true);
    setError(null);

    try {
      const result = await api.reserveHandle(handle, email);
      setReservation(result);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في الحجز');
    } finally {
      setIsReserving(false);
    }
  }, [handle]);

  const claimHandle = useCallback(async (email: string, password: string): Promise<HandleResponse | null> => {
    if (!handle) return null;

    setIsClaiming(true);
    setError(null);

    try {
      const result = await api.claimHandle({ handle, email, password });
      return result;
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في المطالبة');
      return null;
    } finally {
      setIsClaiming(false);
    }
  }, [handle]);

  const reset = useCallback(() => {
    setHandle('');
    setAvailability(null);
    setReservation(null);
    setError(null);
  }, []);

  return {
    handle,
    setHandle,
    isChecking,
    isReserving,
    isClaiming,
    availability,
    reservation,
    error,
    checkAvailability,
    reserveHandle,
    claimHandle,
    reset,
  };
}
