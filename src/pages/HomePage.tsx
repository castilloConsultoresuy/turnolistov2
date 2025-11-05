import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket as TicketIcon, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueueStore } from '@/hooks/useQueueStore';
import { toast } from 'sonner';
export function HomePage() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const createTicket = useQueueStore(s => s.createTicket);
  const isLoading = useQueueStore(s => s.isLoading);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Por favor, ingresa tu nombre.');
      return;
    }
    const newTicket = await createTicket(name.trim());
    if (newTicket) {
      toast.success(`¡Bienvenido, ${name.trim()}! Tu turno está listo.`);
      navigate(`/ticket/${newTicket.id}`);
    } else {
      toast.error('No se pudo crear un turno. Por favor, intenta de nuevo.');
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-playful-yellow p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, #3B82F6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #F43F5E 0%, transparent 50%), radial-gradient(circle at 50% 90%, #3B82F6 0%, transparent 40%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="z-10"
      >
        <Card className="w-full max-w-md rounded-2xl shadow-2xl border-4 border-foreground bg-background/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              className="mx-auto mb-4"
            >
              <TicketIcon className="h-16 w-16 text-playful-blue" />
            </motion.div>
            <CardTitle className="font-display text-4xl">TurnoListo</CardTitle>
            <CardDescription className="text-lg">¿Listo para tu turno?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="name"
                  type="text"
                  placeholder="Ingresa tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-center text-lg rounded-xl focus:ring-2 focus:ring-playful-blue"
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-14 text-xl font-bold bg-playful-blue hover:bg-blue-700 text-white rounded-xl transition-transform duration-200 active:scale-95"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin h-6 w-6" />
                ) : (
                  '¡Tomar mi turno!'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <footer className="text-center mt-8 text-gray-800/70 font-medium">
          <p>Hecho con ❤️ en Cloudflare</p>
        </footer>
      </motion.div>
    </div>
  );
}