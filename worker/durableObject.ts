import { DurableObject } from "cloudflare:workers";
import type { QueueState, Ticket, TicketStatus } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
const getInitialState = (): QueueState => ({
  tickets: [],
  currentlyServing: null,
  lastTicketNumber: 0,
});
export class GlobalDurableObject extends DurableObject {
    async getQueueState(): Promise<QueueState> {
      const state = await this.ctx.storage.get<QueueState>("queue_state");
      return state || getInitialState();
    }
    async createTicket(name: string): Promise<Ticket> {
      const state = await this.getQueueState();
      const newTicketNumber = state.lastTicketNumber + 1;
      const newTicket: Ticket = {
        id: uuidv4(),
        number: newTicketNumber,
        name,
        status: 'waiting',
        createdAt: new Date().toISOString(),
      };
      const newState: QueueState = {
        ...state,
        tickets: [...state.tickets, newTicket],
        lastTicketNumber: newTicketNumber,
      };
      await this.ctx.storage.put("queue_state", newState);
      return newTicket;
    }
    async callNextTicket(): Promise<QueueState> {
      const state = await this.getQueueState();
      const { tickets, currentlyServing } = state;

      const nextTicket = tickets.find(t => t.status === 'waiting');
      let newCurrentlyServing: Ticket | null = null;

      const newTickets = tickets.map(ticket => {
        // Mark the previously serving ticket as 'served'
        if (currentlyServing && ticket.id === currentlyServing.id) {
          return { ...ticket, status: 'served' as TicketStatus };
        }
        // Mark the next waiting ticket as 'serving'
        else if (nextTicket && ticket.id === nextTicket.id) {
          newCurrentlyServing = { ...ticket, status: 'serving' as TicketStatus };
          return newCurrentlyServing;
        }
        // Otherwise, return the ticket as is
        return ticket;
      });

      const newState: QueueState = {
        ...state,
        tickets: newTickets,
        currentlyServing: newCurrentlyServing,
      };

      await this.ctx.storage.put("queue_state", newState);
      return newState;
    }
    async resetQueue(): Promise<QueueState> {
      const initialState = getInitialState();
      await this.ctx.storage.put("queue_state", initialState);
      return initialState;
    }
}