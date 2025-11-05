import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueueStore } from '@/hooks/useQueueStore';
import { TicketComponent } from '@/components/Ticket';
import { LoaderCircle, Home, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export function TicketPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const queueState = useQueueStore(state => state.queueState);
  const myTicket = useQueueStore(state => state.myTicket);
  const fetchQueueState = useQueueStore(state => state.fetchQueueState);
  const setMyTicket = useQueueStore(state => state.setMyTicket);
  useEffect(() => {
    fetchQueueState();
    const interval = setInterval(fetchQueueState, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [fetchQueueState]);
  // This effect ensures that if the user refreshes the page,
  // we try to find their ticket from the main queue state.
  useEffect(() => {
    if (!myTicket && queueState && ticketId) {
      const foundTicket = queueState.tickets.find(t => t.id === ticketId);
      if (foundTicket) {
        setMyTicket(foundTicket);
      }
    }
  }, [myTicket, queueState, ticketId, setMyTicket]);
  const handleDownloadTicket = () => {
    if (!myTicket) return;
    const ticketDetails = `
TurnoListo - Detalles de tu Turno
---------------------------------
Nombre: ${myTicket.name}
Número de Turno: ${myTicket.number.toString().padStart(3, '0')}
Fecha y Hora: ${new Date(myTicket.createdAt).toLocaleString()}
Estado: ${myTicket.status}
---------------------------------
Gracias por tu paciencia.
    `;
    const blob = new Blob([ticketDetails.trim()], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TurnoListo-${myTicket.number}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };
  if (!queueState) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-playful-yellow">
        <LoaderCircle className="h-12 w-12 animate-spin text-playful-blue" />
      </div>
    );
  }
  if (!myTicket || myTicket.id !== ticketId) {
    // This handles cases where the ticket ID is invalid or doesn't match stored ticket
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-playful-rose p-4">
        <Card className="text-center max-w-md">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle>Turno no encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">No pudimos encontrar tu turno. Puede que ya haya sido atendido o la fila fue reiniciada.</p>
            <Button asChild>
              <Link to="/"><Home className="mr-2 h-4 w-4" /> Ir al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const currentlyServingNumber = queueState.currentlyServing?.number ?? 0;
  const waitingTickets = queueState.tickets.filter(t => t.status === 'waiting' && t.number < myTicket.number);
  const position = waitingTickets.length;
  const isMyTurn = myTicket.status === 'serving';
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-playful-yellow p-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <TicketComponent ticket={myTicket} isCurrent={isMyTurn} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <Card className="rounded-2xl shadow-lg border-2 border-foreground">
          <CardContent className="p-6 text-center">
            {isMyTurn ? (
              <div className="text-playful-blue animate-pulse">
                <h3 className="text-2xl font-bold">¡Es tu turno!</h3>
                <p className="text-lg">Por favor, acércate al mostrador.</p>
              </div>
            ) : myTicket.status === 'served' ? (
                 <div className="text-gray-500">
                    <h3 className="text-2xl font-bold">¡Gracias!</h3>
                    <p className="text-lg">Tu turno ha finalizado.</p>
                </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-muted-foreground">Atendiendo Actualmente</p>
                  <p className="font-display text-5xl font-bold">{currentlyServingNumber.toString().padStart(3, '0')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Personas delante de ti</p>
                  <p className="font-display text-5xl font-bold text-playful-rose">{position}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <Button onClick={handleDownloadTicket} className="w-full rounded-xl" variant="outline">
          <Download className="mr-2 h-4 w-4" /> Descargar Turno
        </Button>
        <Button asChild variant="link" className="text-muted-foreground">
          <Link to="/"><Home className="mr-2 h-4 w-4" /> Tomar otro turno</Link>
        </Button>
      </div>
    </div>
  );
}