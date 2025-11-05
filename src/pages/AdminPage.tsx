import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, UserCheck, Trash2, LoaderCircle, BellRing, Download, LogIn, LogOut, Lock } from 'lucide-react';
import { useQueueStore } from '@/hooks/useQueueStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
// In a real application, this would be a more secure environment variable.
const ADMIN_PASSWORD = "admin";
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const queueState = useQueueStore(s => s.queueState);
  const fetchQueueState = useQueueStore(s => s.fetchQueueState);
  const callNextTicket = useQueueStore(s => s.callNextTicket);
  const resetQueue = useQueueStore(s => s.resetQueue);
  const isLoading = useQueueStore(s => s.isLoading);
  useEffect(() => {
    fetchQueueState();
    const interval = setInterval(fetchQueueState, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchQueueState]);
  const handleCallNext = async () => {
    await callNextTicket();
    toast.success("¡Se ha llamado al siguiente cliente!");
  };
  const handleResetQueue = async () => {
    await resetQueue();
    toast.info("La fila ha sido reiniciada.");
  };
  const handleDownloadHistory = async () => {
    try {
      const response = await fetch('/api/queue/history');
      if (!response.ok) {
        throw new Error('La respuesta de la red no fue correcta');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'turnolisto_historial.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Historial descargado exitosamente.");
    } catch (error) {
      console.error("Error al descargar el historial:", error);
      toast.error("No se pudo descargar el historial.");
    }
  };
  const waitingTickets = queueState?.tickets.filter(t => t.status === 'waiting') || [];
  const currentlyServing = queueState?.currentlyServing;
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona la fila de clientes en tiempo real.</p>
        </div>
        <Button onClick={onLogout} variant="outline" className="rounded-xl">
          <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
        </Button>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BellRing /> Acciones</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button
                onClick={handleCallNext}
                disabled={isLoading || waitingTickets.length === 0}
                className="w-full h-14 text-lg font-bold bg-playful-blue hover:bg-blue-700 text-white rounded-xl transition-transform duration-200 active:scale-95"
              >
                {isLoading ? <LoaderCircle className="animate-spin" /> : 'Llamar Siguiente Cliente'}
              </Button>
              <Button
                onClick={handleDownloadHistory}
                variant="outline"
                className="w-full h-12 rounded-xl"
                disabled={isLoading || !queueState || queueState.tickets.length === 0}
              >
                <Download className="mr-2 h-4 w-4" /> Descargar Historial
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full h-12 rounded-xl"
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Reiniciar Fila
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente la fila actual y a todos los clientes en espera.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetQueue} className="bg-destructive hover:bg-destructive/90">
                      Sí, reiniciar fila
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
          <Card className="shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCheck /> Atendiendo</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              {currentlyServing ? (
                <div>
                  <p className="font-display text-7xl font-bold text-playful-blue">{currentlyServing.number.toString().padStart(3, '0')}</p>
                  <p className="text-2xl font-medium text-foreground mt-2">{currentlyServing.name}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-lg p-8">No se está atendiendo a ningún cliente.</p>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Waiting List */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg rounded-2xl h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users /> Lista de Espera</CardTitle>
              <CardDescription>
                {waitingTickets.length} cliente(s) esperando en la fila.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] pr-4">
                {waitingTickets.length > 0 ? (
                  <ul className="space-y-3">
                    <AnimatePresence>
                      {waitingTickets.map((ticket, index) => (
                        <motion.li
                          key={ticket.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center justify-between p-4 bg-background rounded-lg border"
                        >
                          <div className="flex items-center gap-4">
                            <span className="flex items-center justify-center h-10 w-10 rounded-full bg-playful-yellow text-gray-800 font-bold text-lg">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-foreground">{ticket.name}</p>
                              <p className="text-sm text-muted-foreground">Turno #{ticket.number.toString().padStart(3, '0')}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleTimeString()}
                          </p>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-10">
                    <Users className="h-16 w-16 mb-4" />
                    <h3 className="text-xl font-semibold">¡La fila está vacía!</h3>
                    <p>Esperando a que llegue el primer cliente.</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        toast.success("��Bienvenido!");
        onLogin();
      } else {
        toast.error("Contraseña incorrecta. Inténtalo de nuevo.");
      }
      setIsLoading(false);
      setPassword('');
    }, 500);
  };
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-sm rounded-2xl shadow-2xl border-2 border-foreground">
          <CardHeader className="text-center">
            <Lock className="mx-auto h-12 w-12 text-playful-blue mb-4" />
            <CardTitle className="font-display text-3xl">Acceso de Administrador</CardTitle>
            <CardDescription>Ingresa la contraseña para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-center text-lg rounded-xl"
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="w-full h-12 text-lg font-bold bg-playful-blue hover:bg-blue-700 text-white rounded-xl transition-transform duration-200 active:scale-95"
                disabled={isLoading || !password}
              >
                {isLoading ? <LoaderCircle className="animate-spin" /> : <><LogIn className="mr-2 h-5 w-5" /> Ingresar</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const handleLogin = () => {
    sessionStorage.setItem('isAdminAuthenticated', 'true');
    setIsAuthenticated(true);
  };
  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
    toast.info("Has cerrado sesión.");
  };
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminDashboard onLogout={handleLogout} />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}