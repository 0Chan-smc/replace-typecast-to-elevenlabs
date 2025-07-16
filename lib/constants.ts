export const ELEVENLABS_CONFIG = {
  VOICE_ID: 'Fcu5ohsG7HuIwJZBxrun',
  MODEL_ID: 'eleven_multilingual_v2',
  OUTPUT_FORMAT: 'mp3_44100_128',
  BASE_URL: 'https://api.elevenlabs.io/v1',
} as const;

export const TEXT_LIMITS = {
  MAX_LENGTH: 5000,
  MIN_LENGTH: 1,
} as const;

export const AUDIO_CONFIG = {
  DEFAULT_VOLUME: 1,
  TIMER_UPDATE_INTERVAL: 10,
} as const;