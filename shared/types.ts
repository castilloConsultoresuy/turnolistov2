export type TicketStatus = 'waiting' | 'serving' | 'served';
export interface Ticket {
  id: string;
  number: number;
  name: string;
  status: TicketStatus;
  createdAt: string;
}
export interface QueueState {
  tickets: Ticket[];
  currentlyServing: Ticket | null;
  lastTicketNumber: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}