import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const validateTextInput = (text: string): string | null => {
  if (!text.trim()) {
    return '텍스트를 입력해주세요.';
  }
  
  if (text.length > 5000) {
    return '텍스트는 5000자 이하로 입력해주세요.';
  }
  
  return null;
};

export const handleApiError = (error: Error): string => {
  console.error('ElevenLabs API Error:', error);
  
  if (error.message.includes('rate limit')) {
    return '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
  }
  
  if (error.message.includes('authentication')) {
    return 'API 인증에 실패했습니다.';
  }
  
  return '음성 생성 중 오류가 발생했습니다. 다시 시도해주세요.';
};