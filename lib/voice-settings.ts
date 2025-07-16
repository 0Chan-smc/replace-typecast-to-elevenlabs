import type { VoiceSettings } from '@/types/api';

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 50,
  similarity_boost: 50,
  style: 50,
  speed: 50,
  use_speaker_boost: false,
};

export const VOICE_SETTINGS_RANGES = {
  stability: { min: 0, max: 100, step: 1 },
  similarity_boost: { min: 0, max: 100, step: 1 },
  style: { min: 0, max: 100, step: 1 },
  speed: { min: 0, max: 100, step: 1 },
} as const;

// UI 값을 ElevenLabs API 값으로 변환하는 함수
export const convertToApiSettings = (uiSettings: VoiceSettings) => {
  // 값들을 적절한 범위로 변환하고 clamp 처리
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const roundToDecimal = (value: number, decimals: number) => Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  
  const converted = {
    stability: roundToDecimal(clamp(uiSettings.stability / 100, 0.0, 1.0), 2),
    similarity_boost: roundToDecimal(clamp(uiSettings.similarity_boost / 100, 0.0, 1.0), 2),
    style: roundToDecimal(clamp(uiSettings.style / 100, 0.0, 1.0), 2),
    speed: roundToDecimal(clamp(0.7 + (uiSettings.speed / 100) * 0.5, 0.7, 1.2), 2), // 0.7-1.2 범위로 변환
    use_speaker_boost: uiSettings.use_speaker_boost,
  };
  
  console.log('Converting UI settings:', uiSettings);
  console.log('To API settings:', converted);
  
  return converted;
};

export const VOICE_SETTINGS_LABELS = {
  stability: {
    label: 'Stability',
    description: '안정성',
    leftLabel: '가변적',
    rightLabel: '안정적',
    warning: '30% 미만은 불안정할 수 있습니다',
  },
  similarity_boost: {
    label: 'Similarity',
    description: '유사성',
    leftLabel: '낮음',
    rightLabel: '높음',
  },
  style: {
    label: 'Style Exaggeration',
    description: '스타일 과장',
    leftLabel: '없음',
    rightLabel: '과장됨',
    warning: '50% 초과는 불안정할 수 있습니다',
  },
  speed: {
    label: 'Speed',
    description: '속도',
    leftLabel: '느림',
    rightLabel: '빠름',
  },
  use_speaker_boost: {
    label: 'Speaker boost',
    description: '스피커 부스트',
  },
} as const;