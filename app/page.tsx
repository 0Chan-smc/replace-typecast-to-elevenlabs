'use client'

import { useState, useEffect } from 'react'
import TextInput from '@/components/voice/TextInput'
import LoadingTimer from '@/components/voice/LoadingTimer'
import AudioPlayer from '@/components/voice/AudioPlayer'
import VoiceSettings from '@/components/voice/VoiceSettings'
import { VoiceSelector } from '@/components/voice/VoiceSelector'
import { createAudioUrl, cleanupAudioUrl } from '@/lib/audio-utils'
import { handleApiError } from '@/lib/utils'
import {
  DEFAULT_VOICE_SETTINGS,
  DEFAULT_SEED_SETTINGS,
  generateRandomSeed,
} from '@/lib/voice-settings'
import {
  parseSequentialStereo,
  processSequentialStereo,
} from '@/lib/web-audio-utils'
import type { AudioItem } from '@/types/audio'
import type {
  VoiceSettings as VoiceSettingsType,
  SeedSettings,
} from '@/types/api'

// 기본 텍스트
const DEFAULT_NORMAL_TEXT =
  '지은아! 부정적인 말 금지! 너 짱이라니까? <break time="0.5s" />  오케이! 지은아! 멋진 거 인정! <break time="0.5s" /> 지은아! 니가 어떤 모습이어도 좋아~ <break time="0.5s" /> 지은아. 너 지금 잘하고 있어!  <break time="0.5s" />  지은아! 너 진짜 지금이 리즈야!'
const DEFAULT_STEREO_TEXT =
  '[L]지은아! 부정적인 말 금지! 너 짱이라니까?[/L]<break time="1.0s" />[R]오케이! 지은아! 멋진 거 인정![/R]<break time="0.5s" />[L]지은아! 니가 어떤 모습이어도 좋아~[/L]<break time="1.0s" />[R]지은아! 너 진짜 지금이 리즈야![/R]'

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [audioItems, setAudioItems] = useState<AudioItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsType>(
    DEFAULT_VOICE_SETTINGS,
  )
  const [seedSettings, setSeedSettings] = useState<SeedSettings>(
    DEFAULT_SEED_SETTINGS,
  )
  const [currentProcessingTime, setCurrentProcessingTime] = useState<number>(0)
  const [processingStage, setProcessingStage] = useState<
    'api' | 'stereo' | null
  >(null)
  const [isStereoMode, setIsStereoMode] = useState(false)
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null)
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null)
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null)

  // localStorage에서 설정 불러오기
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('voiceSettings')
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        setVoiceSettings(parsedSettings)
      }

      const savedSeedSettings = localStorage.getItem('seedSettings')
      if (savedSeedSettings) {
        const parsedSeedSettings = JSON.parse(savedSeedSettings)
        setSeedSettings(parsedSeedSettings)
      }
    } catch (error) {
      console.error('설정 불러오기 실패:', error)
    }
  }, [])

  // Voice Settings 변경 시 localStorage에 저장
  const handleVoiceSettingsChange = (newSettings: VoiceSettingsType) => {
    setVoiceSettings(newSettings)
    try {
      localStorage.setItem('voiceSettings', JSON.stringify(newSettings))
    } catch (error) {
      console.error('Voice Settings 저장 실패:', error)
    }
  }

  // Seed Settings 변경 시 localStorage에 저장
  const handleSeedSettingsChange = (newSeedSettings: SeedSettings) => {
    setSeedSettings(newSeedSettings)
    try {
      localStorage.setItem('seedSettings', JSON.stringify(newSeedSettings))
    } catch (error) {
      console.error('Seed Settings 저장 실패:', error)
    }
  }

  const handleTextSubmit = async (text: string) => {
    setIsLoading(true)
    setError(null)
    setCurrentProcessingTime(0)
    setProcessingStage('api')

    // seed 값 결정
    const finalSeed = seedSettings.useRandomSeed
      ? generateRandomSeed()
      : seedSettings.fixedSeed

    // 실시간 타이머 시작
    const startTime = Date.now()
    const timer = setInterval(() => {
      setCurrentProcessingTime(Date.now() - startTime)
    }, 100)

    try {
      let finalAudioUrl: string
      let totalProcessingTime = 0

      if (isStereoMode) {
        // 스테레오 모드: 순차적 처리
        const { segments, cleanText } = parseSequentialStereo(text)
        console.log('Stereo segments:', segments)
        console.log('Clean text:', cleanText)

        // 1단계: 단일 API 호출 (태그 제거된 텍스트)
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voice_settings: voiceSettings,
            seed: finalSeed,
            voice_id: selectedVoiceId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '음성 생성에 실패했습니다.')
        }

        const processingTimeHeader = response.headers.get('X-Processing-Time')
        const apiProcessingTime = processingTimeHeader
          ? parseInt(processingTimeHeader)
          : 0
        const apiEndTime = Date.now()

        const audioData = await response.arrayBuffer()

        // 2단계: 순차적 스테레오 처리
        setProcessingStage('stereo')
        setCurrentProcessingTime(0)

        const stereoStartTime = Date.now()
        const stereoTimer = setInterval(() => {
          setCurrentProcessingTime(Date.now() - stereoStartTime)
        }, 100)

        try {
          const stereoBlob = await processSequentialStereo(
            audioData,
            segments,
            cleanText,
          )
          finalAudioUrl = createAudioUrl(await stereoBlob.arrayBuffer())
          clearInterval(stereoTimer)

          totalProcessingTime =
            apiProcessingTime + (Date.now() - stereoStartTime)
        } catch (stereoError) {
          console.error('스테레오 처리 오류:', stereoError)
          clearInterval(stereoTimer)
          // 스테레오 처리 실패 시 원본 오디오 사용
          finalAudioUrl = createAudioUrl(audioData)
          totalProcessingTime = apiProcessingTime
        }
      } else {
        // 일반 모드: 기존 방식
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice_settings: voiceSettings,
            seed: finalSeed,
            voice_id: selectedVoiceId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || '음성 생성에 실패했습니다.')
        }

        const processingTimeHeader = response.headers.get('X-Processing-Time')
        totalProcessingTime = processingTimeHeader
          ? parseInt(processingTimeHeader)
          : 0

        const audioData = await response.arrayBuffer()
        finalAudioUrl = createAudioUrl(audioData)
      }

      const newItemId = crypto.randomUUID()
      const newAudioItem: AudioItem = {
        id: newItemId,
        audioUrl: finalAudioUrl,
        text,
        processingTime: totalProcessingTime,
        createdAt: new Date(),
        voiceSettings,
        seed: finalSeed,
        voiceId: selectedVoiceId || undefined,
        voiceName: selectedVoiceName || undefined,
      }

      setAudioItems((prev) => [newAudioItem, ...prev])
      setNewlyCreatedId(newItemId)

      // 3초 후 애니메이션 제거
      setTimeout(() => {
        setNewlyCreatedId(null)
      }, 3000)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? handleApiError(error)
          : '알 수 없는 오류가 발생했습니다.'
      setError(errorMessage)
    } finally {
      clearInterval(timer)
      setIsLoading(false)
      setCurrentProcessingTime(0)
      setProcessingStage(null)
    }
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        isStereoMode
          ? 'bg-gradient-to-br from-indigo-100 to-purple-200'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}
    >
      <div className='mx-auto max-w-4xl p-6'>
        <div className='text-center pt-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            세마리토끼: ElevenLabs 셍이 TTS 변환 서비스
          </h1>
          <p className='text-lg text-gray-600 mb-6'>
            Typecast를 ElevenLabs로 대체 가능성 확인 용도의 페이지입니다.
          </p>

          {/* 스테레오 모드 토글 */}
          <div className='flex items-center justify-center space-x-3 mb-6'>
            <span
              className={`text-sm font-medium ${
                isStereoMode ? 'text-gray-500' : 'text-gray-900'
              }`}
            >
              일반 모드
            </span>
            <div className='relative'>
              <input
                type='checkbox'
                checked={isStereoMode}
                onChange={(e) => setIsStereoMode(e.target.checked)}
                className='sr-only'
                id='stereo-toggle'
              />
              <label
                htmlFor='stereo-toggle'
                className={`flex items-center cursor-pointer w-14 h-8 rounded-full transition-colors ${
                  isStereoMode ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    isStereoMode ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </label>
            </div>
            <span
              className={`text-sm font-medium ${
                isStereoMode ? 'text-purple-700' : 'text-gray-500'
              }`}
            >
              스테레오 모드
            </span>
          </div>

          {isStereoMode && (
            <div className='text-sm text-purple-700 bg-purple-50 rounded-lg p-3 mx-auto max-w-2xl'>
              💡 스테레오 모드: [L]좌측[/L], [R]우측[/R] 태그를 사용하여 공간감
              있는 음성을 생성하세요
              <br />
              ⚠️ 아직 개발 중인 기능입니다. 타이밍이 부정확할 수 있습니다.
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Text Input Section */}
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg shadow-lg p-8 space-y-6'>
              <TextInput
                onSubmit={handleTextSubmit}
                isLoading={isLoading}
                processingTime={currentProcessingTime}
                processingStage={processingStage}
                isStereoMode={isStereoMode}
                defaultText={isStereoMode ? DEFAULT_STEREO_TEXT : DEFAULT_NORMAL_TEXT}
                selectedVoiceId={selectedVoiceId}
                voiceSelector={
                  <VoiceSelector
                    selectedVoiceId={selectedVoiceId || undefined}
                    onVoiceSelect={(voiceId, voiceName) => {
                      setSelectedVoiceId(voiceId)
                      setSelectedVoiceName(voiceName)
                    }}
                  />
                }
              />

              {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <p className='text-red-700 text-sm'>{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Voice Settings Section */}
          <div className='lg:col-span-1'>
            <VoiceSettings
              settings={voiceSettings}
              seedSettings={seedSettings}
              onSettingsChange={handleVoiceSettingsChange}
              onSeedSettingsChange={handleSeedSettingsChange}
            />
          </div>
        </div>

        {audioItems.length > 0 && (
          <div className='space-y-4 mt-6'>
            <h2 className='text-xl font-semibold text-gray-800'>
              생성된 음성 목록 ({audioItems.length}개)
            </h2>
            {audioItems.map((audioItem, index) => (
              <div key={audioItem.id} className='relative'>
                <div className='absolute -left-12 top-4 text-sm font-bold text-white bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white'>
                  {audioItems.length - index}
                </div>
                <AudioPlayer
                  audioItem={audioItem}
                  autoPlay={audioItem.id === newlyCreatedId}
                  isNew={audioItem.id === newlyCreatedId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default HomePage
