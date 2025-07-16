export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface AudioItem {
  id: string;
  audioUrl: string;
  text: string;
  processingTime: number;
  createdAt: Date;
  voiceSettings: import('@/types/api').VoiceSettings;
  timestamps?: TimestampData[];
}

export interface AudioPlayerProps {
  audioItem: AudioItem;
}

export interface TimestampData {
  start: number;
  end: number;
  text: string;
}