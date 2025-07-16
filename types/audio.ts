export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface AudioPlayerProps {
  audioUrl: string;
  timestamps?: TimestampData[];
}

export interface TimestampData {
  start: number;
  end: number;
  text: string;
}