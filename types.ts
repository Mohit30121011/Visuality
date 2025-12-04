
export interface SignalData {
  cnn_score: number;
  freq_score: number;
  prnu_score: number;
  metadata_flags: string[];
}

export interface ArtifactUrls {
  prnu_url?: string;
  spectrum_url?: string;
  gradcam_url?: string;
}

export interface AnalysisResult {
  id: string;
  score: number; // 0.0 (Real) to 1.0 (Fake)
  label: 'real' | 'synthetic';
  confidence: number;
  signals: SignalData;
  explanation: string;
  reverse_prompt?: string; // New field for estimated generation prompt
  artifacts?: ArtifactUrls;
  model_version: string;
  timestamp: string;
  // For chart visualization (mocked spectrum data)
  frequency_data: { frequency: number; power: number }[];
}

// --- Text Analysis Types ---

export interface TextSignalData {
  perplexity_score: number; // 0 (Natural) to 1 (High/Weird)
  burstiness_score: number;
  stylometry_score: number;
  formatting_flags: string[];
}

export interface TextAnalysisResult {
  id: string;
  score: number;
  label: 'human' | 'ai' | 'uncertain';
  confidence: number;
  signals: TextSignalData;
  explanation: string;
  reverse_prompt?: string; // New field for estimated generation prompt
  model_version: string;
  timestamp: string;
  suspicious_sentences: string[]; // List of sentences flagged as likely AI
  analyzed_text: string; // The original text
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface UploadState {
  file: File | null;
  previewUrl: string | null;
}

export interface TextState {
  text: string;
  isFile: boolean;
}

// --- User & Subscription Types ---

export type SubscriptionTier = 'Free' | 'Pro' | 'Enterprise';

export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
  plan: SubscriptionTier;
  credits: number;
  maxCredits: number;
  joinedAt: string; // ISO Date string
}

export type ViewMode = 'HOME' | 'SETTINGS' | 'HISTORY';

// --- History Types ---

export type HistoryItem = 
  | (AnalysisResult & { type: 'image'; thumbnail?: string }) 
  | (TextAnalysisResult & { type: 'text' });

// --- Google Auth Types ---
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: () => void;
        }
      }
    }
  }
}
