import type { VoicesResponse, Voice } from '@/types/voice'

export const fetchVoices = async (pageToken?: string): Promise<VoicesResponse> => {
  const url = new URL('/api/voices', window.location.origin)
  if (pageToken) {
    url.searchParams.set('page_token', pageToken)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || '음성 목록을 가져오는데 실패했습니다.')
  }

  return response.json()
}

export const filterVoicesByCategory = (voices: Voice[], category?: 'premade' | 'cloned'): Voice[] => {
  if (!category) return voices
  return voices.filter((voice) => voice.category === category)
}

export const filterVoicesByLanguage = (voices: Voice[], language?: string): Voice[] => {
  if (!language) return voices
  return voices.filter((voice) => voice.labels.language === language)
}

export const sortVoicesByName = (voices: Voice[]): Voice[] => {
  return [...voices].sort((a, b) => a.name.localeCompare(b.name))
}