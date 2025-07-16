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