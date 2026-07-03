import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { synth } from '../utils/audio';
import { APP_NOTES } from '../types';

interface FreePlayScreenProps {
  onBack: () => void;
}

export default function FreePlayScreen({ onBack }: FreePlayScreenProps) {
  // Track which bars are currently pressed/active to show flash animations
  const [activeBars, setActiveBars] = useState<Record<string, boolean>>({});

  // Include all 7 notes: DO, RE, MI, FA, SOL, LA, SI
  const freePlayNotes = APP_NOTES;

  const handlePress = (noteId: string, frequency: number) => {
    synth.playNote(frequency, 1.8);
    setActiveBars((prev) => ({ ...prev, [noteId]: true }));
    // Reset after a short delay for flash animation
    setTimeout(() => {
      setActiveBars((prev) => ({ ...prev, [noteId]: false }));
    }, 300);
  };

  return (
    <div id="free-play-view" className="fixed inset-0 bg-[#0A2240] select-none overflow-hidden z-50 flex flex-col">
      {/* Header bar with return button and elegant subtitle */}
      <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center pointer-events-none">
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onBack}
          className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-white/10 hover:border-white/25 rounded-full text-white text-xs font-medium backdrop-blur-md transition-all active:scale-95"
          id="btn-back-to-invitation"
        >
          <ArrowLeft className="w-4 h-4 text-[#E9C126]" />
          <span>Volver a la Invitación</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[10px] uppercase font-mono tracking-widest text-[#E9C126]"
        >
          <Sparkles className="w-3 h-3" />
          <span>Modo Teclado Libre</span>
        </motion.div>
      </div>

      {/* Grid of full-height columns or full-width rows */}
      <div className="flex-1 w-full h-full flex flex-col md:flex-row pt-24 md:pt-0 pb-6 md:pb-0 px-4 md:px-0 gap-2 md:gap-0">
        {freePlayNotes.map((note, index) => {
          const isActive = !!activeBars[note.id];
          
          // Background colors as requested: 
          // DO (White), RE (Light Blue #4A90E2), MI (Soft Cyan #aadee9), FA (Dark Blue #006ea5), etc.
          let colBg = 'bg-white';
          let borderCol = 'border-black/10';
          let textCol = 'text-slate-900';
          let glowColor = 'rgba(255, 255, 255, 0.4)';

          if (note.id === 'RE') {
            colBg = 'bg-[#4A90E2]';
            textCol = 'text-white';
            borderCol = 'border-white/15';
            glowColor = 'rgba(74, 144, 226, 0.5)';
          } else if (note.id === 'MI') {
            colBg = 'bg-[#aadee9]';
            textCol = 'text-slate-900';
            borderCol = 'border-slate-900/15';
            glowColor = 'rgba(170, 222, 233, 0.5)';
          } else if (note.id === 'FA') {
            colBg = 'bg-[#006ea5]';
            textCol = 'text-white';
            borderCol = 'border-white/15';
            glowColor = 'rgba(0, 110, 165, 0.5)';
          } else if (note.id === 'SOL') {
            colBg = 'bg-[#E9C126]';
            textCol = 'text-slate-950';
            borderCol = 'border-slate-950/15';
            glowColor = 'rgba(233, 193, 38, 0.5)';
          } else if (note.id === 'LA') {
            colBg = 'bg-[#f7931e]';
            textCol = 'text-white';
            borderCol = 'border-white/15';
            glowColor = 'rgba(247, 147, 30, 0.5)';
          } else if (note.id === 'SI') {
            colBg = 'bg-[#00b7ed]';
            textCol = 'text-slate-950';
            borderCol = 'border-slate-950/15';
            glowColor = 'rgba(0, 183, 237, 0.5)';
          }

          return (
            <motion.div
              key={note.id}
              id={`free-play-bar-${note.id.toLowerCase()}`}
              className={`relative flex-1 w-full md:h-full cursor-pointer flex flex-row md:flex-col justify-between items-center py-3 px-5 md:py-16 md:px-4 select-none transition-all duration-300 rounded-lg md:rounded-none border ${borderCol} md:border-0 md:border-r md:last:border-r-0 ${colBg} ${textCol}`}
              onPointerDown={() => handlePress(note.id, note.frequency)}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08, type: 'spring', damping: 18 }}
              style={{ touchAction: 'none' }}
            >
              {/* Labels (Responsive: stacked on desktop, inline on mobile) */}
              <div className="flex flex-row md:flex-col items-baseline md:items-center text-left md:text-center gap-2 md:gap-0">
                <span className="font-display font-bold text-lg md:text-2xl tracking-widest block uppercase">
                  {note.name}
                </span>
                <span className="font-mono text-[9px] md:text-[10px] tracking-widest opacity-60 block md:mt-1">
                  {note.frequency.toFixed(2)} Hz
                </span>
              </div>

              {/* Touch Indicator / Accent (Responsive: horizontal on mobile, stacked on desktop) */}
              <div className="flex flex-row md:flex-col items-center gap-2 md:gap-3">
                <span className="font-mono text-[9px] md:text-[10px] tracking-widest uppercase opacity-40">
                  Tocar
                </span>
                <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${note.id === 'DO' ? 'bg-slate-400' : 'bg-black/30 md:bg-white/40'}`} />
              </div>

              {/* Intensity Flash Overlay */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-white z-10 pointer-events-none rounded-lg md:rounded-none"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{
                      boxShadow: `inset 0 0 50px ${glowColor}`,
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
