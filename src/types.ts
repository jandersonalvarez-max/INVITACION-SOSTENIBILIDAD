export type AppMode = 'narrative' | 'free-play';

export interface NoteConfig {
  id: string;
  name: string;
  frequency: number;
  color: string;
  bgHex: string;
}

export interface StepConfig {
  id: number;
  title: string;
  subtitle?: string;
  activeNoteId: string | null; // Null means no active key (e.g., portada) or all active (final)
  description?: string;
}

export const APP_NOTES: NoteConfig[] = [
  { id: 'DO', name: 'DO', frequency: 261.63, color: 'text-white', bgHex: '#FFFFFF' },
  { id: 'RE', name: 'RE', frequency: 293.66, color: 'text-[#4A90E2]', bgHex: '#4A90E2' },
  { id: 'MI', name: 'MI', frequency: 329.63, color: 'text-[#aadee9]', bgHex: '#aadee9' },
  { id: 'FA', name: 'FA', frequency: 349.23, color: 'text-[#006ea5]', bgHex: '#006ea5' },
  { id: 'SOL', name: 'SOL', frequency: 392.00, color: 'text-[#E9C126]', bgHex: '#E9C126' },
  { id: 'LA', name: 'LA', frequency: 440.00, color: 'text-[#f7931e]', bgHex: '#f7931e' },
  { id: 'SI', name: 'SI', frequency: 493.88, color: 'text-[#00b7ed]', bgHex: '#00b7ed' },
];

export interface RsvpState {
  confirmed: boolean;
  name: string;
  email: string;
  guests: number;
  submitted: boolean;
}
