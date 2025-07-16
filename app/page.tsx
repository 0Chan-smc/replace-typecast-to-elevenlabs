"use client";

import { useState, useEffect } from 'react';
import TextInput from '@/components/voice/TextInput';
import LoadingTimer from '@/components/voice/LoadingTimer';
import AudioPlayer from '@/components/voice/AudioPlayer';
import VoiceSettings from '@/components/voice/VoiceSettings';
import { createAudioUrl, cleanupAudioUrl } from '@/lib/audio-utils';
import { handleApiError } from '@/lib/utils';
import { DEFAULT_VOICE_SETTINGS } from '@/lib/voice-settings';
import type { AudioItem } from '@/types/audio';
import type { VoiceSettings as VoiceSettingsType } from '@/types/api';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioItems, setAudioItems] = useState<AudioItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettingsType>(DEFAULT_VOICE_SETTINGS);
  const [currentProcessingTime, setCurrentProcessingTime] = useState<number>(0);

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
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          voice_settings: voiceSettings 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '음성 생성에 실패했습니다.');
      }

      const processingTimeHeader = response.headers.get('X-Processing-Time');
      const processingTime = processingTimeHeader ? parseInt(processingTimeHeader) : 0;

      const audioData = await response.arrayBuffer();
      const audioUrl = createAudioUrl(audioData);
      
      const newAudioItem: AudioItem = {
        id: crypto.randomUUID(),
        audioUrl,
        text,
        processingTime,
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-auto max-w-4xl p-6">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            세마리토끼 Typecast를 ElevenLabs로 대체
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            ElevenLabs API를 사용한 텍스트 음성 변환 서비스
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Text Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <TextInput 
                onSubmit={handleTextSubmit} 
                isLoading={isLoading} 
                processingTime={currentProcessingTime}
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
            <h2 className="text-xl font-semibold text-gray-800">생성된 음성 목록</h2>
            {audioItems.map((audioItem) => (
              <AudioPlayer key={audioItem.id} audioItem={audioItem} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default HomePage;