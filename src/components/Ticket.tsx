import { motion } from 'framer-motion';
import { Ticket as TicketIcon, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Ticket, TicketStatus } from '@shared/types';
interface TicketProps {
  ticket: Ticket;
  className?: string;
  isCurrent?: boolean;
}
const statusStyles: { [key in TicketStatus]: string } = {
  waiting: 'bg-playful-yellow text-gray-800',
  serving: 'bg-playful-blue text-white animate-pulse',
  served: 'bg-gray-300 text-gray-500 opacity-70',
};
const statusTranslations: { [key in TicketStatus]: string } = {
    waiting: 'esperando',
    serving: 'atendiendo',
    served: 'atendido',
};
export function TicketComponent({ ticket, className, isCurrent = false }: TicketProps) {
  if (!ticket) return null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-dashed border-gray-300 relative',
        isCurrent && 'ring-4 ring-playful-blue ring-offset-2',
        className
      )}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TicketIcon className="h-8 w-8 text-playful-blue" />
            <span className="font-display text-2xl font-bold">TurnoListo</span>
          </div>
          <div className={cn('px-3 py-1 rounded-full text-sm font-bold capitalize', statusStyles[ticket.status])}>
            {statusTranslations[ticket.status]}
          </div>
        </div>
        <div className="text-center my-8">
          <p className="text-muted-foreground text-lg">Tu Número</p>
          <h2 className="font-display text-8xl font-bold text-foreground tracking-tighter">{ticket.number.toString().padStart(3, '0')}</h2>
        </div>
        <div className="border-t border-dashed border-gray-300 my-4" />
        <div className="space-y-3 text-lg">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-muted-foreground" />
            <span className="font-medium">{ticket.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-muted-foreground" />
            <div className="text-sm">
                <p className="font-medium text-muted-foreground">Fecha y Hora</p>
                <p className="font-semibold">{new Date(ticket.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 -left-5 w-10 h-10 bg-background rounded-full transform -translate-y-1/2 border-2 border-dashed border-gray-300" />
      <div className="absolute top-1/2 -right-5 w-10 h-10 bg-background rounded-full transform -translate-y-1/2 border-2 border-dashed border-gray-300" />
    </motion.div>
  );
}