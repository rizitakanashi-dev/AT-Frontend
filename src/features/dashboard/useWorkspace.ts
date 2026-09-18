import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { fetcher } from '@/lib/api';
import type { UserDTO } from '@/types/absensi';
import { todayISO } from './absensiService';

export function useProfile() {
  return useSWR<UserDTO>('/v1/auth/me', fetcher).data;
}

export function useToday() {
  const [date, setDate] = useState(todayISO);
  useEffect(() => {
    const interval = window.setInterval(() => setDate(todayISO()), 30000);
    return () => window.clearInterval(interval);
  }, []);
  return date;
}

export function useRefreshWorkspace() {
  const { mutate } = useSWRConfig();
  return () => mutate((key) => key !== '/v1/auth/me');
}
