export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  ANALYZING = 'ANALYZING',
  VIEWING = 'VIEWING',
}

export interface DreamAnalysis {
  transcription: string;
  emotionalTheme: string;
  interpretation: {
    summary: string;
    archetypes: string[];
    psychologicalMeaning: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}