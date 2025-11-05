import { create } from 'zustand';
import type { QueueState, Ticket, ApiResponse } from '@shared/types';
import { persist, createJSONStorage } from 'zustand/middleware';
interface QueueStore {
  queueState: QueueState | null;
  myTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  fetchQueueState: () => Promise<void>;
  createTicket: (name: string) => Promise<Ticket | null>;
  callNextTicket: () => Promise<void>;
  resetQueue: () => Promise<void>;
  setMyTicket: (ticket: Ticket | null) => void;
}
const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  console.log(`[API Request] ${options?.method || 'GET'} ${url}`, options);
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network response was not ok' }));
    console.error(`[API Error] ${url}:`, errorData);
    throw new Error(errorData.error || 'An unknown error occurred');
  }
  const data: ApiResponse<T> = await res.json();
  console.log(`[API Response] ${url}:`, data);
  if (!data.success) {
    throw new Error(data.error || 'API returned an error');
  }
  return data.data as T;
};
export const useQueueStore = create<QueueStore>()(
  persist(
    (set, get) => ({
      queueState: null,
      myTicket: null,
      isLoading: false,
      error: null,
      setMyTicket: (ticket) => set({ myTicket: ticket }),
      fetchQueueState: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchApi<QueueState>('/api/queue/state');
          set({ queueState: data, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : String(error), isLoading: false });
        }
      },
      createTicket: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
          const newTicket = await fetchApi<Ticket>('/api/queue/ticket', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
          });
          set({ myTicket: newTicket, isLoading: false });
          get().fetchQueueState(); // Refresh queue state
          return newTicket;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : String(error), isLoading: false });
          return null;
        }
      },
      callNextTicket: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchApi<QueueState>('/api/queue/next', { method: 'POST' });
          set({ queueState: data, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : String(error), isLoading: false });
        }
      },
      resetQueue: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await fetchApi<QueueState>('/api/queue/reset', { method: 'POST' });
          set({ queueState: data, myTicket: null, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : String(error), isLoading: false });
        }
      },
    }),
    {
      name: 'turnolisto-queue-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ myTicket: state.myTicket }),
    }
  )
);