"use client";

import { useState } from 'react';
import TextInput from '@/components/voice/TextInput';
import LoadingTimer from '@/components/voice/LoadingTimer';
import AudioPlayer from '@/components/voice/AudioPlayer';
import { createAudioUrl, cleanupAudioUrl } from '@/lib/audio-utils';
import { handleApiError } from '@/lib/utils';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTextSubmit = async (text: string) => {
    setIsLoading(true);
    setError(null);
    
    if (audioUrl) {
      cleanupAudioUrl(audioUrl);
      setAudioUrl(null);
    }

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '음성 생성에 실패했습니다.');
      }

      const processingTimeHeader = response.headers.get('X-Processing-Time');
      if (processingTimeHeader) {
        setProcessingTime(parseInt(processingTimeHeader));
      }

      const audioData = await response.arrayBuffer();
      const url = createAudioUrl(audioData);
      setAudioUrl(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? handleApiError(error) : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
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
        
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <TextInput onSubmit={handleTextSubmit} isLoading={isLoading} />
          
          {isLoading && <LoadingTimer isLoading={isLoading} />}
          
          {processingTime && !isLoading && (
            <div className="text-center text-sm text-gray-600">
              처리 시간: {(processingTime / 1000).toFixed(2)}초
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {audioUrl && !isLoading && (
            <AudioPlayer audioUrl={audioUrl} />
          )}
        </div>
      </div>
    </main>
  );
};

export default HomePage;