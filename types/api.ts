export interface VoiceSettings {
  stability: number; // 0-100
  similarity_boost: number; // 0-100  
  style: number; // 0-100
  speed: number; // 0-100
  use_speaker_boost: boolean;
}

export interface ElevenLabsRequest {
  text: string;
  model_id: string;
  voice_settings?: VoiceSettings;
  seed?: number;
}

export interface SeedSettings {
  useRandomSeed: boolean;
  fixedSeed: number;
}

export interface ElevenLabsResponse {
  audio: ArrayBuffer;
}

export interface ApiError {
  error: string;
  message?: string;
}