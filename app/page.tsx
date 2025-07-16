"use client";

import { useState, useEffect } from 'react';
import TextInput from '@/components/voice/TextInput';
import LoadingTimer from '@/components/voice/LoadingTimer';
import AudioPlayer from '@/components/voice/AudioPlayer';
import VoiceSettings from '@/components/voice/VoiceSettings';
import { createAudioUrl, cleanupAudioUrl } from '@/lib/audio-utils';
import { handleApiError } from '@/lib/utils';
import { DEFAULT_VOICE_SETTINGS } from '@/lib/voice-settings';
import { parseTextForStereo, getCleanText, createChannelAudio } from '@/lib/stereo-utils';
import type { AudioItem } from '@/types/audio';
import type { VoiceSettings as VoiceSettingsType } from '@/types/api';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsType>(DEFAULT_VOICE_SETTINGS);
  const [currentProcessingTime, setCurrentProcessingTime] = useState<number>(0);
  const [isStereoMode, setIsStereoMode] = useState(false);

  // localStorage에서 Voice Settings 불러오기
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('voiceSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setVoiceSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Voice Settings 불러오기 실패:', error);
    }
  }, []);

  // Voice Settings 변경 시 localStorage에 저장
  const handleVoiceSettingsChange = (newSettings: VoiceSettingsType) => {
    setVoiceSettings(newSettings);
    try {
      localStorage.setItem('voiceSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Voice Settings 저장 실패:', error);
    }
  };

  const handleTextSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentProcessingTime(0);
    
    // 실시간 타이머 시작
    const startTime = Date.now();
    const timer = setInterval(() => {
      setCurrentProcessingTime(Date.now() - startTime);
    }, 100);

    try {
      // 스테레오 모드일 때 텍스트 파싱
      let apiText = text;
      if (isStereoMode) {
        const segments = parseTextForStereo(text);
        apiText = getCleanText(text);
        console.log('Stereo segments:', segments);
      }

      // 1단계: ElevenLabs API 호출
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: apiText,
          voice_settings: voiceSettings 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '음성 생성에 실패했습니다.');
      }

      const processingTimeHeader = response.headers.get('X-Processing-Time');
      const apiProcessingTime = processingTimeHeader ? parseInt(processingTimeHeader) : 0;

      const audioData = await response.arrayBuffer();
      let finalAudioUrl: string;
      let totalProcessingTime = apiProcessingTime;

      // 2단계: 스테레오 모드일 때 ffmpeg 처리
      if (isStereoMode) {
        try {
          // 스테레오 처리 시작 시간
          const stereoStartTime = Date.now();
          
          // 임시로 간단한 스테레오 변환 (실제 세그먼트 기반 처리는 추후 구현)
          const stereoBlob = await createChannelAudio(audioData, 'left');
          finalAudioUrl = createAudioUrl(await stereoBlob.arrayBuffer());
          
          const stereoProcessingTime = Date.now() - stereoStartTime;
          totalProcessingTime = apiProcessingTime + stereoProcessingTime;
        } catch (stereoError) {
          console.error('스테레오 처리 오류:', stereoError);
          // 스테레오 처리 실패 시 원본 오디오 사용
          finalAudioUrl = createAudioUrl(audioData);
        }
      } else {
        finalAudioUrl = createAudioUrl(audioData);
      }
      
      const newAudioItem: AudioItem = {
        id: crypto.randomUUID(),
        audioUrl: finalAudioUrl,
        text,
        processingTime: totalProcessingTime,
        createdAt: new Date(),
        voiceSettings,
      };

      setAudioItems(prev => [newAudioItem, ...prev]);
    } catch (error) {
      const errorMessage = error instanceof Error ? handleApiError(error) : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      clearInterval(timer);
      setIsLoading(false);
      setCurrentProcessingTime(0);
    }
  };

  return (
    <main className={`min-h-screen transition-colors duration-300 ${
      isStereoMode 
        ? 'bg-gradient-to-br from-indigo-100 to-purple-200' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className="mx-auto max-w-4xl p-6">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            세마리토끼 Typecast를 ElevenLabs로 대체
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            ElevenLabs API를 사용한 텍스트 음성 변환 서비스
          </p>
          
          {/* 스테레오 모드 토글 */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <span className={`text-sm font-medium ${isStereoMode ? 'text-gray-500' : 'text-gray-900'}`}>
              일반 모드
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={isStereoMode}
                onChange={(e) => setIsStereoMode(e.target.checked)}
                className="sr-only"
                id="stereo-toggle"
              />
              <label
                htmlFor="stereo-toggle"
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
            <span className={`text-sm font-medium ${isStereoMode ? 'text-purple-700' : 'text-gray-500'}`}>
              스테레오 모드
            </span>
          </div>
          
          {isStereoMode && (
            <div className="text-sm text-purple-700 bg-purple-50 rounded-lg p-3 mx-auto max-w-lg">
              💡 스테레오 모드: [L]좌측[/L], [R]우측[/R] 태그를 사용하여 공간감 있는 음성을 생성하세요
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Text Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <TextInput 
                onSubmit={handleTextSubmit} 
                isLoading={isLoading} 
                processingTime={currentProcessingTime}
                isStereoMode={isStereoMode}
              />
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Voice Settings Section */}
          <div className="lg:col-span-1">
            <VoiceSettings 
              settings={voiceSettings}
              onSettingsChange={handleVoiceSettingsChange}
            />
          </div>
        </div>

        {audioItems.length > 0 && (
          <div className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold text-gray-800">
              생성된 음성 목록 ({audioItems.length}개)
            </h2>
            {audioItems.map((audioItem, index) => (
              <div key={audioItem.id} className="relative">
                <div className="absolute -left-12 top-4 text-sm font-bold text-white bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white">
                  {audioItems.length - index}
                </div>
                <AudioPlayer audioItem={audioItem} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HomePage;