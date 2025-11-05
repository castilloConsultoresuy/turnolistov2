import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueueStore } from '@/hooks/useQueueStore';
import { Volume2, Ticket } from 'lucide-react';
// Web Audio API function to play a notification sound
const playNotificationSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    // Sound parameters
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
    // Play the sound
    oscillator.start(audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (error) {
    console.error("Could not play notification sound:", error);
  }
};
export function DisplayPage() {
  const queueState = useQueueStore(s => s.queueState);
  const fetchQueueState = useQueueStore(s => s.fetchQueueState);
  const prevTicketNumber = useRef<number | null | undefined>(null);
  useEffect(() => {
    fetchQueueState();
    const interval = setInterval(fetchQueueState, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [fetchQueueState]);
  useEffect(() => {
    const currentTicketNumber = queueState?.currentlyServing?.number;
    if (currentTicketNumber && currentTicketNumber !== prevTicketNumber.current) {
      playNotificationSound();
    }
    prevTicketNumber.current = currentTicketNumber;
  }, [queueState?.currentlyServing]);
  const currentTicket = queueState?.currentlyServing;
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 overflow-hidden">
      <header className="absolute top-8 left-8 flex items-center gap-3 text-gray-400">
        <Ticket className="h-8 w-8" />
        <h1 className="font-display text-3xl">Pantalla TurnoListo</h1>
      </header>
      <main className="flex flex-col items-center justify-center text-center flex-1">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-5xl md:text-7xl font-semibold text-playful-yellow tracking-wider">Atendiendo</h2>
        </motion.div>
        <div className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-playful-blue rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentTicket?.id || 'none'}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              className="font-display font-bold text-white tracking-tighter"
              style={{ fontSize: '12rem', lineHeight: 1 }}
            >
              {currentTicket ? currentTicket.number.toString().padStart(3, '0') : '---'}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-8 h-20">
            <AnimatePresence mode="wait">
                <motion.div
                    key={(currentTicket?.name || 'waiting') + '-name'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl text-gray-300 font-medium"
                >
                    {currentTicket ? currentTicket.name : 'Esperando al próximo cliente...'}
                </motion.div>
            </AnimatePresence>
        </div>
      </main>
      <footer className="absolute bottom-8 right-8 flex items-center gap-2 text-gray-500">
        <Volume2 className="h-6 w-6" />
        <span>Sonido Activado</span>
      </footer>
    </div>
  );
}