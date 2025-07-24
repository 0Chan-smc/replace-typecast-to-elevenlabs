'use client'

import { useState, useEffect } from 'react'
import { fetchVoices, filterVoicesByCategory, sortVoicesByName } from '@/lib/voice-api'
import type { Voice } from '@/types/voice'

interface VoiceSelectorProps {
  selectedVoiceId?: string
  onVoiceSelect: (voiceId: string, voiceName: string) => void
  className?: string
}

export const VoiceSelector = ({ selectedVoiceId, onVoiceSelect, className }: VoiceSelectorProps) => {
  const [voices, setVoices] = useState<Voice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'cloned' | 'premade'>('cloned')

  useEffect(() => {
    const loadVoices = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetchVoices()
        setVoices(response.voices)
      } catch (err) {
        setError(err instanceof Error ? err.message : '음성 목록을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadVoices()
  }, [])

  const filteredVoices = () => {
    // 사용자 음성만 표시
    const filtered = filterVoicesByCategory(voices, 'cloned')
    return sortVoicesByName(filtered)
  }

  const handleVoiceSelect = (voiceId: string, voiceName: string) => {
    onVoiceSelect(voiceId, voiceName)
  }

  const playPreview = (previewUrl: string) => {
    const audio = new Audio(previewUrl)
    audio.play().catch((err) => {
      console.error('미리듣기 재생 실패:', err)
    })
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${className}`}>
        <h3 className="mb-3 text-sm font-medium text-gray-900">음성 선택</h3>
        <div className="flex items-center justify-center py-8 text-sm text-gray-500">
          음성 목록을 불러오는 중...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${className}`}>
        <h3 className="mb-3 text-sm font-medium text-gray-900">음성 선택</h3>
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-900">음성 선택</h3>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {filteredVoices().map((voice) => (
          <div
            key={voice.voice_id}
            className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50 ${
              selectedVoiceId === voice.voice_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => handleVoiceSelect(voice.voice_id, voice.name)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">{voice.name}</span>
                </div>
                {voice.labels.language && (
                  <div className="mt-1 text-xs text-gray-500">언어: {voice.labels.language}</div>
                )}
                {(voice.labels.description || voice.labels.gender || voice.labels.age) && (
                  <div className="mt-1 text-xs text-gray-500">
                    {[voice.labels.description, voice.labels.gender, voice.labels.age]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </div>
              {voice.preview_url && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playPreview(voice.preview_url)
                  }}
                  className="ml-2 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
                >
                  미리듣기
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredVoices().length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">선택할 수 있는 음성이 없습니다.</div>
      )}
    </div>
  )
}