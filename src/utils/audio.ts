/**
 * Web Audio API Synthesizer for "La Composición del Futuro"
 * Generates clean, warm, analog-like synthesizer sounds with ADSR envelopes and filter sweeps.
 */

class SynthEngine {
  private ctx: AudioContext | null = null;

  // Initialize AudioContext on first interaction
  private init() {
    if (!this.ctx) {
      // Support legacy webkitAudioContext if necessary
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play a synth pluck note at the specified frequency.
   * @param frequency Frequency in Hz
   * @param duration Duration in seconds
   * @param delay Optional start delay in seconds
   */
  public playNote(frequency: number, duration = 1.5, delay = 0) {
    try {
      const ctx = this.init();
      const startTime = ctx.currentTime + delay;

      // 1. Create Nodes
      // Primary Warm Oscillator (Triangle)
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(frequency, startTime);

      // Sub Oscillator (Sine for depth and body)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency, startTime);

      // Filter (Lowpass with a pluck envelope)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      // Start high, sweep down for a warm "wow" pluck sound
      filter.frequency.setValueAtTime(frequency * 4, startTime);
      filter.frequency.exponentialRampToValueAtTime(frequency * 1.5, startTime + 0.4);
      filter.Q.setValueAtTime(1, startTime);

      // Volume Gain Node (ADSR Envelope)
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, startTime);
      
      // Attack: quick swell (0.04s)
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.04);
      
      // Decay to Sustain: decline to a lower level (0.2s)
      gainNode.gain.exponentialRampToValueAtTime(0.12, startTime + 0.24);
      
      // Release: fade out slowly starting after sustain duration
      const releaseStart = startTime + duration - 0.4;
      gainNode.gain.setValueAtTime(0.12, releaseStart);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      // Connect nodes
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Start & Stop
      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    } catch (error) {
      console.warn('Failed to play synthesized sound:', error);
    }
  }

  /**
   * Play an ambient start sound (smooth deep synthesizer chord)
   */
  public playAmbientStart() {
    // Elegant deep chord (C Major 9 / C Major add 9)
    // C3 (130.81), G3 (196.00), C4 (261.63), E4 (329.63), B4 (493.88)
    const frequencies = [130.81, 196.00, 261.63, 329.63, 493.88];
    frequencies.forEach((freq, idx) => {
      this.playNote(freq, 2.5, idx * 0.05);
    });
  }

  /**
   * Play the triumphant chord concluding the narrative
   * Staggered arpeggio of DO, RE, MI, FA, SOL that rings out together!
   */
  public playTriumphantChord() {
    const scale = [
      261.63, // DO (C4)
      293.66, // RE (D4)
      329.63, // MI (E4)
      349.23, // FA (F4)
      392.00, // SOL (G4)
    ];

    // Play as a beautiful staggered wave
    scale.forEach((freq, index) => {
      // Give each subsequent note a 120ms delay, and let them ring longer
      this.playNote(freq, 3.0, index * 0.12);
    });

    // Add a deep octaved root support (C3 = 130.81 Hz) for majestic fullness!
    this.playNote(130.81, 3.5, 0);
    this.playNote(196.00, 3.5, 0.2); // G3
  }
}

export const synth = new SynthEngine();
