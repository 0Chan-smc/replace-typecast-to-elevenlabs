"use client";

import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { downloadAudio } from '@/lib/audio-utils';
import { getDisplayValue } from '@/lib/value-display';
import type { AudioPlayerProps, AudioPlayerState } from '@/types/audio';

const AudioPlayer = ({ audioItem }: AudioPlayerProps) => {
  const { audioUrl, text, processingTime, createdAt, voiceSettings } = audioItem;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioState, setAudioState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setAudioState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const updateDuration = () => {
      setAudioState(prev => ({
        ...prev,
        duration: audio.duration || 0,
      }));
    };

    const handleEnded = () => {
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioState.isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setAudioState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setAudioState(prev => ({
      ...prev,
      currentTime: newTime,
    }));
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const timestamp = createdAt.getTime();
      downloadAudio(blob, `voice-${timestamp}`);
    } catch (error) {
      console.error('다운로드 오류:', error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      handlePlayPause();
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border p-6 space-y-4"
      role="region" 
      aria-label="오디오 플레이어"
    >
      <div className="space-y-2">
        <div className="text-sm text-gray-500">
          생성 시간: {createdAt.toLocaleString('ko-KR')} · <span className="font-bold">처리 시간: {(processingTime / 1000).toFixed(2)}초</span>
        </div>
        <div className="text-sm text-gray-700 bg-gray-50 rounded p-3">
          {text}
        </div>
        <div className="text-xs text-gray-600 bg-blue-50 rounded p-3">
          <div className="font-medium text-blue-800 mb-1">음성 설정</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Speed: {getDisplayValue(voiceSettings.speed, 'speed')}</div>
            <div>Stability: {getDisplayValue(voiceSettings.stability, 'stability')}</div>
            <div>Similarity: {getDisplayValue(voiceSettings.similarity_boost, 'similarity_boost')}</div>
            <div>Style: {getDisplayValue(voiceSettings.style, 'style')}</div>
          </div>
          <div className="mt-1">
            Speaker boost: {voiceSettings.use_speaker_boost ? '켜짐' : '꺼짐'}
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        aria-label="생성된 음성 파일"
      />

      <div className="flex items-center space-x-4">
        <button
          onClick={handlePlayPause}
          onKeyDown={handleKeyDown}
          className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          aria-label={audioState.isPlaying ? '일시정지' : '재생'}
        >
          {audioState.isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1 space-y-2">
          <input
            type="range"
            min={0}
            max={audioState.duration || 0}
            value={audioState.currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            aria-label="오디오 진행률"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>{formatTime(audioState.currentTime)}</span>
            <span>{formatTime(audioState.duration)}</span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center w-10 h-10 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="오디오 파일 다운로드"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default AudioPlayer;