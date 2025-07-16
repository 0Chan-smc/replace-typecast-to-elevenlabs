export interface ElevenLabsRequest {
  text: string;
  model_id: string;
}

export interface ElevenLabsResponse {
  audio: ArrayBuffer;
}

export interface ApiError {
  error: string;
  message?: string;
}