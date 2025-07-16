"use client";

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { VoiceSettings } from '@/types/api';
import { DEFAULT_VOICE_SETTINGS, VOICE_SETTINGS_RANGES, VOICE_SETTINGS_LABELS } from '@/lib/voice-settings';
import { getDisplayValue } from '@/lib/value-display';

interface VoiceSettingsProps {
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
}

const VoiceSettings = ({ settings, onSettingsChange }: VoiceSettingsProps) => {
  const handleSliderChange = (key: keyof Omit<VoiceSettings, 'use_speaker_boost'>, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const handleToggleChange = (checked: boolean) => {
    onSettingsChange({
      ...settings,
      use_speaker_boost: checked,
    });
  };

  const handleReset = () => {
    onSettingsChange(DEFAULT_VOICE_SETTINGS);
  };

  return (
    <div className="bg-white rounded-lg border shadow-md p-8 space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">음성 설정</h3>
        <button
          onClick={handleReset}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="기본값으로 재설정"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Speed */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              {VOICE_SETTINGS_LABELS.speed.label}
            </label>
            <span className="text-sm text-gray-500">{getDisplayValue(settings.speed, 'speed')}</span>
          </div>
          <input
            type="range"
            min={VOICE_SETTINGS_RANGES.speed.min}
            max={VOICE_SETTINGS_RANGES.speed.max}
            step={VOICE_SETTINGS_RANGES.speed.step}
            value={settings.speed}
            onChange={(e) => handleSliderChange('speed', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{VOICE_SETTINGS_LABELS.speed.leftLabel}</span>
            <span>{VOICE_SETTINGS_LABELS.speed.rightLabel}</span>
          </div>
        </div>

        {/* Stability */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              {VOICE_SETTINGS_LABELS.stability.label}
            </label>
            <span className="text-sm text-gray-500">{getDisplayValue(settings.stability, 'stability')}</span>
          </div>
          <input
            type="range"
            min={VOICE_SETTINGS_RANGES.stability.min}
            max={VOICE_SETTINGS_RANGES.stability.max}
            step={VOICE_SETTINGS_RANGES.stability.step}
            value={settings.stability}
            onChange={(e) => handleSliderChange('stability', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{VOICE_SETTINGS_LABELS.stability.leftLabel}</span>
            <span>{VOICE_SETTINGS_LABELS.stability.rightLabel}</span>
          </div>
          {settings.stability < 30 && (
            <div className="text-xs text-orange-600">
              {VOICE_SETTINGS_LABELS.stability.warning}
            </div>
          )}
        </div>

        {/* Similarity */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              {VOICE_SETTINGS_LABELS.similarity_boost.label}
            </label>
            <span className="text-sm text-gray-500">{getDisplayValue(settings.similarity_boost, 'similarity_boost')}</span>
          </div>
          <input
            type="range"
            min={VOICE_SETTINGS_RANGES.similarity_boost.min}
            max={VOICE_SETTINGS_RANGES.similarity_boost.max}
            step={VOICE_SETTINGS_RANGES.similarity_boost.step}
            value={settings.similarity_boost}
            onChange={(e) => handleSliderChange('similarity_boost', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{VOICE_SETTINGS_LABELS.similarity_boost.leftLabel}</span>
            <span>{VOICE_SETTINGS_LABELS.similarity_boost.rightLabel}</span>
          </div>
        </div>

        {/* Style Exaggeration */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-700">
              {VOICE_SETTINGS_LABELS.style.label}
            </label>
            <span className="text-sm text-gray-500">{getDisplayValue(settings.style, 'style')}</span>
          </div>
          <input
            type="range"
            min={VOICE_SETTINGS_RANGES.style.min}
            max={VOICE_SETTINGS_RANGES.style.max}
            step={VOICE_SETTINGS_RANGES.style.step}
            value={settings.style}
            onChange={(e) => handleSliderChange('style', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{VOICE_SETTINGS_LABELS.style.leftLabel}</span>
            <span>{VOICE_SETTINGS_LABELS.style.rightLabel}</span>
          </div>
          {settings.style > 50 && (
            <div className="text-xs text-orange-600">
              {VOICE_SETTINGS_LABELS.style.warning}
            </div>
          )}
        </div>

        {/* Speaker Boost */}
        <div className="flex items-center justify-between pt-2">
          <label className="text-sm font-medium text-gray-700">
            {VOICE_SETTINGS_LABELS.use_speaker_boost.label}
          </label>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.use_speaker_boost}
              onChange={(e) => handleToggleChange(e.target.checked)}
              className="sr-only"
              id="speaker-boost"
            />
            <label
              htmlFor="speaker-boost"
              className={`flex items-center cursor-pointer w-10 h-6 rounded-full transition-colors ${
                settings.use_speaker_boost ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  settings.use_speaker_boost ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </label>
          </div>
        </div>
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

export default VoiceSettings;