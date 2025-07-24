export interface VoiceSample {
  sample_id: string
  file_name: string
  mime_type: string
  size_bytes: number
  hash: string
  duration_secs: number
}

export interface VoiceLabels {
  accent?: string
  description?: string
  descriptive?: string
  age?: string
  gender?: string
  language?: string
  use_case?: string
}

export interface Voice {
  voice_id: string
  name: string
  samples?: VoiceSample[] | null
  category: 'premade' | 'cloned'
  labels: VoiceLabels
  description?: string | null
  preview_url: string
  is_owner: boolean
  is_legacy: boolean
  created_at_unix?: number | null
}

export interface VoicesResponse {
  voices: Voice[]
  has_more: boolean
  total_count: number
  next_page_token?: string
}

export interface VoiceError {
  error: string
  status?: number
  details?: string
}