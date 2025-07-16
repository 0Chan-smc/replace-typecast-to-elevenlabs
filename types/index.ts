export interface SpeechRequest {
  text: string;
}

export interface SpeechResponse {
  audioUrl: string;
  processingTime: number;
  timestamps?: TimestampData[];
}

export interface TimestampData {
  start: number;
  end: number;
  text: string;
}