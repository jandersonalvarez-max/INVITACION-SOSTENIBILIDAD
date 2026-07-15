import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  SlidersHorizontal, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Sparkles
} from 'lucide-react';
import { synth } from './utils/audio';
import { APP_NOTES, AppMode } from './types';
import FreePlayScreen from './components/FreePlayScreen';

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [mode, setMode] = useState<AppMode>('narrative');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [playedChordOnFinal, setPlayedChordOnFinal] = useState<boolean>(false);
  const [activeNotePulse, setActiveNotePulse] = useState<string | null>(null);
  const [conceptRevealed, setConceptRevealed] = useState<boolean>(false);

  // Auto-play triumphant chord once when reaching Screen 6
  useEffect(() => {
    if (currentStep === 6 && !playedChordOnFinal && soundEnabled) {
      // Small timeout to allow screen to mount before playing chord
      const timer = setTimeout(() => {
        synth.playTriumphantChord();
        setPlayedChordOnFinal(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentStep, playedChordOnFinal, soundEnabled]);

  // If we return to earlier steps, reset the final chord trigger so it can play again
  useEffect(() => {
    if (currentStep < 6) {
      setPlayedChordOnFinal(false);
    }
    setConceptRevealed(false);
  }, [currentStep]);

  // Play start sound upon entering the narrative step 2 (from portada)
  const handleStart = () => {
    if (soundEnabled) {
      synth.playAmbientStart();
    }
    setCurrentStep(2);
  };

  // Restarts the interactive invitation journey
  const handleRestart = () => {
    setCurrentStep(1);
    setPlayedChordOnFinal(false);
  };

  // Keyboard Keys definitions for Screens 2, 3, 4, 5 (contains 4 keys: DO, RE, MI, FA)
  // Screen 6 contains 5 keys: DO, RE, MI, FA, SOL
  const getKeysForStep = (step: number) => {
    if (step === 6) {
      return APP_NOTES; // 5 keys
    }
    return APP_NOTES.slice(0, 4); // 4 keys for screens 2, 3, 4, 5
  };

  const getActiveKeyForStep = (step: number): string | null => {
    switch (step) {
      case 2: return 'DO';
      case 3: return 'RE';
      case 4: return 'MI';
      case 5: return 'FA';
      case 6: return 'ALL'; // All keys active on final screen
      default: return null;
    }
  };

  const handleKeyTouch = (noteId: string, frequency: number, isActive: boolean) => {
    if (!isActive) return;

    // Trigger synth sound
    if (soundEnabled) {
      if (noteId === 'DO') {
        // "Emite una nota profunda"
        // Play deep Support note along with original frequency for maximum deepness
        synth.playNote(130.81, 1.8);
        synth.playNote(261.63, 1.5);
      } else if (noteId === 'RE') {
        // "Emite una nota en armonía"
        synth.playNote(146.83, 1.6);
        synth.playNote(293.66, 1.5);
      } else if (noteId === 'MI') {
        synth.playNote(329.63, 1.5);
      } else if (noteId === 'FA') {
        synth.playNote(349.23, 1.5);
      } else {
        synth.playNote(frequency, 1.5);
      }
    }

    // Flash animation trigger
    setActiveNotePulse(noteId);
    setTimeout(() => setActiveNotePulse(null), 300);

    // Proceed in sequence if on step 2, 3, 4, or 5
    if (currentStep === 2 && noteId === 'DO') {
      setConceptRevealed(true);
      setTimeout(() => setCurrentStep(3), 1000);
    } else if (currentStep === 3 && noteId === 'RE') {
      setConceptRevealed(true);
      setTimeout(() => setCurrentStep(4), 1000);
    } else if (currentStep === 4 && noteId === 'MI') {
      setConceptRevealed(true);
      setTimeout(() => setCurrentStep(5), 1000);
    } else if (currentStep === 5 && noteId === 'FA') {
      setConceptRevealed(true);
      setTimeout(() => setCurrentStep(6), 1000);
    }
  };

  // Free play state within narrative final screen or any key
  const renderKeyboard = () => {
    const keys = getKeysForStep(currentStep);
    const activeKeyId = getActiveKeyForStep(currentStep);

    return (
      <div className="w-full max-w-2xl mx-auto px-4 mt-8 mb-4">
        <div className="flex justify-center items-end gap-2.5 sm:gap-4 h-48 sm:h-56 relative">
          {keys.map((key) => {
            const isKeyActive = activeKeyId === 'ALL' || activeKeyId === key.id;
            const isPulse = activeNotePulse === key.id;
            
            // Inactive key coloring
            let keyColorClasses = 'bg-slate-950/40 border border-white/5 text-white/20';
            
            // Custom colors when illuminated
            if (isKeyActive) {
              if (key.id === 'DO') keyColorClasses = 'bg-white text-slate-900 border-white shadow-lg key-glow-active';
              if (key.id === 'RE') keyColorClasses = 'bg-[#006ea5] text-white border-[#006ea5]/80 shadow-lg key-glow-active';
              if (key.id === 'MI') keyColorClasses = 'bg-[#50ade2] text-white border-[#50ade2]/80 shadow-lg key-glow-active';
              if (key.id === 'FA') keyColorClasses = 'bg-[#f6b102] text-slate-950 border-[#f6b102]/80 shadow-lg key-glow-active';
              if (key.id === 'SOL') keyColorClasses = 'bg-[#aadee9] text-slate-950 border-[#aadee9]/80 shadow-lg key-glow-active';
              if (key.id === 'LA') keyColorClasses = 'bg-[#4A90E2] text-white border-[#4A90E2]/80 shadow-lg key-glow-active';
              if (key.id === 'SI') keyColorClasses = 'bg-[#00b7ed] text-slate-950 border-[#00b7ed]/80 shadow-lg key-glow-active';
            }

            return (
              <motion.button
                key={key.id}
                id={`invitation-key-${key.id.toLowerCase()}`}
                onClick={() => handleKeyTouch(key.id, key.frequency, isKeyActive)}
                whileTap={isKeyActive ? { scale: 0.94, y: 4 } : {}}
                className={`relative flex-1 h-full rounded-b-xl flex flex-col justify-end pb-6 items-center select-none transition-all duration-300 ${keyColorClasses} ${
                  isKeyActive ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'
                }`}
                style={{
                  boxShadow: isPulse ? '0 0 45px rgba(255,255,255,1)' : undefined,
                  touchAction: 'manipulation',
                }}
              >
                {/* Active note indicators */}
                {isKeyActive && (
                  <span className="absolute top-4 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Dynamic keyboard help text below */}
        <div className="text-center mt-4">
          <p className="font-mono text-[10px] uppercase text-white/40 tracking-wider">
            {currentStep === 6 
              ? "Toca libremente cualquier tecla para componer la armonía" 
              : `Presiona la tecla iluminada (${activeKeyId}) para continuar con la composición`}
          </p>
        </div>
      </div>
    );
  };

  // If in Free Play screen, render it
  if (mode === 'free-play') {
    return <FreePlayScreen onBack={() => setMode('narrative')} />;
  }

  return (
    <div className="min-h-screen bg-[#0A2240] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Absolute ambient backgrounds */}
      <div className="absolute inset-0 tech-grid pointer-events-none z-0" />
      <div className="absolute inset-0 radial-spotlight pointer-events-none z-0" />

      {/* Header bar controls */}
      <header className="relative w-full z-10 p-4 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E9C126] animate-pulse" />
          <span className="font-display font-medium text-xs uppercase tracking-widest text-white/70">
            Componer el Futuro
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-white/5 border border-white/5 hover:border-white/15 text-white/60 hover:text-white transition-all active:scale-95"
            title={soundEnabled ? "Silenciar" : "Activar sonido"}
            id="btn-sound-toggle"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#E9C126]" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Skip to Fullscreen Mode (Pantalla 6) */}
          <button
            onClick={() => setMode('free-play')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#E9C126]/15 hover:bg-[#E9C126]/25 border border-[#E9C126]/45 hover:border-[#E9C126]/70 rounded-full text-[11px] sm:text-xs font-bold text-[#E9C126] transition-all active:scale-95 shadow-[0_0_12px_rgba(233,193,38,0.2)] animate-pulse-subtle"
            id="btn-trigger-free-play"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E9C126]" />
            <span>Teclado Completo</span>
          </button>
        </div>
      </header>

      {/* Narrative Progress Indicator */}
      {currentStep > 1 && (
        <div className="relative z-10 w-full max-w-md mx-auto px-6 mt-2">
          <div className="flex items-center justify-between mb-1.5 text-[9px] font-mono uppercase tracking-widest text-white/40">
            <span>Progresión Armónica</span>
            <span>{currentStep === 6 ? "Acorde Final" : `Nota ${currentStep - 1} de 4`}</span>
          </div>
          <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden flex gap-1">
            <div className={`h-full flex-1 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-white' : 'bg-white/5'}`} />
            <div className={`h-full flex-1 rounded-full transition-all duration-500 ${currentStep >= 3 ? 'bg-[#006ea5]' : 'bg-white/5'}`} />
            <div className={`h-full flex-1 rounded-full transition-all duration-500 ${currentStep >= 4 ? 'bg-[#50ade2]' : 'bg-white/5'}`} />
            <div className={`h-full flex-1 rounded-full transition-all duration-500 ${currentStep >= 5 ? 'bg-[#f6b102]' : 'bg-white/5'}`} />
            <div className={`h-full flex-1 rounded-full transition-all duration-500 ${currentStep >= 6 ? 'bg-[#E9C126]' : 'bg-white/5'}`} />
          </div>
        </div>
      )}

      {/* Main Narrative Display */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 relative z-10 py-8">
        <AnimatePresence mode="wait">
          
          {/* Pantalla 1: PORTADA */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.7 }}
              className="w-full max-w-xl mx-auto flex flex-col justify-between items-center h-full min-h-[60vh]"
            >
              <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
                <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl leading-tight tracking-wider text-white uppercase max-w-lg mb-4">
                  El futuro no se predice...
                  <span className="block text-[#E9C126] mt-1 font-extrabold">se compone.</span>
                </h1>
                
                <p className="font-sans font-light text-base sm:text-lg text-white/90 max-w-md mt-4 leading-relaxed">
                  En tus manos está crear el mañana
                </p>
              </div>

              {/* Tap Gesture and Vertical stripes representing keys */}
              <div 
                onClick={handleStart}
                className="w-full max-w-md mt-12 mb-4 cursor-pointer flex flex-col items-center group"
                id="btn-start-narrative"
              >
                <div className="flex flex-col items-center mb-6 tap-indicator">
                  <div className="w-11 h-11 rounded-full bg-[#E9C126]/15 border border-[#E9C126]/30 flex items-center justify-center text-[#E9C126] group-hover:bg-[#E9C126]/30 transition-colors">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                  <span className="font-mono text-[10px] tracking-widest uppercase text-[#E9C126] mt-2">
                    Toca para Iniciar
                  </span>
                </div>

                {/* Abstract key stripes representation */}
                <div className="w-full flex items-end gap-1.5 h-10 px-6 opacity-40 group-hover:opacity-75 transition-opacity">
                  <div className="flex-1 h-full bg-white rounded-t" />
                  <div className="flex-1 h-3/4 bg-[#006ea5] rounded-t" />
                  <div className="flex-1 h-2/3 bg-[#50ade2] rounded-t" />
                  <div className="flex-1 h-4/5 bg-[#f6b102] rounded-t" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Pantalla 2: IMPULSAR (DO) */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl mx-auto flex flex-col justify-between items-center min-h-[60vh]"
            >
              <div className="flex-1 flex flex-col justify-center items-center text-center px-4 max-w-md min-h-[120px]">
                <AnimatePresence>
                  {conceptRevealed && (
                    <motion.h2 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="font-display font-bold text-3xl sm:text-4xl tracking-widest text-white uppercase"
                    >
                      IMPULSAR
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>

              {renderKeyboard()}
            </motion.div>
          )}

          {/* Pantalla 3: NUESTRA GENTE (RE) */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl mx-auto flex flex-col justify-between items-center min-h-[60vh]"
            >
              <div className="flex-1 flex flex-col justify-center items-center text-center px-4 max-w-md min-h-[120px]">
                <AnimatePresence>
                  {conceptRevealed && (
                    <motion.h2 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="font-display font-bold text-3xl sm:text-4xl tracking-widest text-[#006ea5] uppercase"
                    >
                      NUESTRA GENTE
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>

              {renderKeyboard()}
            </motion.div>
          )}

          {/* Pantalla 4: AMBIENTE (MI) */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl mx-auto flex flex-col justify-between items-center min-h-[60vh]"
            >
              <div className="flex-1 flex flex-col justify-center items-center text-center px-4 max-w-md min-h-[120px]">
                <AnimatePresence>
                  {conceptRevealed && (
                    <motion.h2 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="font-display font-bold text-3xl sm:text-4xl tracking-widest text-[#50ade2] uppercase"
                    >
                      AMBIENTE
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>

              {renderKeyboard()}
            </motion.div>
          )}

          {/* Pantalla 5: ENTORNO (FA) */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl mx-auto flex flex-col justify-between items-center min-h-[60vh]"
            >
              <div className="flex-1 flex flex-col justify-center items-center text-center px-4 max-w-md min-h-[120px]">
                <AnimatePresence>
                  {conceptRevealed && (
                    <motion.h2 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="font-display font-bold text-3xl sm:text-4xl tracking-widest text-[#f6b102] uppercase"
                    >
                      ENTORNO
                    </motion.h2>
                  )}
                </AnimatePresence>
              </div>

              {renderKeyboard()}
            </motion.div>
          )}

          {/* Pantalla 6: EL FINAL (Cierre) */}
          {currentStep === 6 && (
            <motion.div
              key="step-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-3xl mx-auto flex flex-col justify-between items-center h-full"
            >
              <div className="flex-1 flex flex-col items-center text-center px-4 py-4 w-full">
                {/* Accumulated text message in upper section */}
                <div className="mb-6 space-y-3 border-b border-white/5 pb-6 max-w-2xl w-full">
                  <p className="font-mono text-[10px] uppercase text-[#E9C126] tracking-widest animate-pulse">
                    Composición Completa
                  </p>
                  
                  <div className="px-5 py-6 sm:py-8 rounded-2xl bg-slate-900/50 border border-white/10 shadow-2xl max-w-xl mx-auto">
                    <p className="font-sans font-medium text-base sm:text-lg text-white leading-relaxed tracking-wide">
                      “Nuestra mayor composición está en camino. Algo está cambiando, y tú serás parte esencial de este nuevo desafío”
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 items-center justify-center pt-3 w-full max-w-xs mx-auto">
                    <span className="w-full text-center px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-mono text-xs text-white uppercase tracking-wider">
                      ★ IMPULSAR
                    </span>
                    <span className="w-full text-center px-3 py-1.5 rounded-full bg-[#006ea5]/10 border border-[#006ea5]/20 font-mono text-xs text-[#006ea5] uppercase tracking-wider">
                      ★ EVOLUCIÓN DE NUESTRA GENTE
                    </span>
                    <span className="w-full text-center px-3 py-1.5 rounded-full bg-[#50ade2]/10 border border-[#50ade2]/20 font-mono text-xs text-[#50ade2] uppercase tracking-wider">
                      ★ SUSTENTABILIDAD AMBIENTAL
                    </span>
                    <span className="w-full text-center px-3 py-1.5 rounded-full bg-[#f6b102]/10 border border-[#f6b102]/20 font-mono text-xs text-[#f6b102] uppercase tracking-wider">
                      ★ BIEN COMÚN
                    </span>
                  </div>
                </div>

                {/* Composer Restart Button */}
                <div className="space-y-4 max-w-lg mx-auto flex flex-col items-center py-2">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    {/* Reset / Restart */}
                    <button
                      onClick={handleRestart}
                      className="flex items-center gap-2 px-6 py-3 bg-[#E9C126] hover:bg-[#d8b022] text-slate-950 text-xs font-bold uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-lg shadow-[#E9C126]/15 cursor-pointer"
                      id="btn-restart"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Volver a componer</span>
                    </button>


                  </div>
                </div>
              </div>

              {/* In final screen, we keep keyboard available to keep playing with it */}
              {renderKeyboard()}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Branding or Info */}
      <footer className="relative w-full z-10 p-4 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between border-t border-white/5 text-[10px] font-mono text-white/30 tracking-wider">
        <span>© 2026 JAVIER ANDERSON • HUMO GROUP</span>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span className="hover:text-white/60 transition-colors cursor-pointer" onClick={() => setMode('free-play')}>
            Modo Libre
          </span>
        </div>
      </footer>
    </div>
  );
}
