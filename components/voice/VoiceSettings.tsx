"use client";

import { useState } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import type { VoiceSettings, SeedSettings } from '@/types/api';
import { DEFAULT_VOICE_SETTINGS, DEFAULT_SEED_SETTINGS, VOICE_SETTINGS_RANGES, VOICE_SETTINGS_LABELS, generateRandomSeed, validateSeed } from '@/lib/voice-settings';
import { getDisplayValue } from '@/lib/value-display';
import Tooltip from '@/components/ui/Tooltip';

interface VoiceSettingsProps {
  settings: VoiceSettings;
  seedSettings: SeedSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
  onSeedSettingsChange: (seedSettings: SeedSettings) => void;
}

const VoiceSettings = ({ settings, seedSettings, onSettingsChange, onSeedSettingsChange }: VoiceSettingsProps) => {
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
    onSeedSettingsChange(DEFAULT_SEED_SETTINGS);
  };

  const handleSeedToggle = (useRandom: boolean) => {
    onSeedSettingsChange({
      ...seedSettings,
      useRandomSeed: useRandom,
    });
  };

  const handleFixedSeedChange = (seed: number) => {
    if (validateSeed(seed)) {
      onSeedSettingsChange({
        ...seedSettings,
        fixedSeed: seed,
      });
    }
  };

  const handleGenerateRandomSeed = () => {
    const newSeed = generateRandomSeed();
    onSeedSettingsChange({
      ...seedSettings,
      fixedSeed: newSeed,
      useRandomSeed: false,
    });
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
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              {VOICE_SETTINGS_LABELS.speed.label}
              <Tooltip content={VOICE_SETTINGS_LABELS.speed.tooltip} />
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
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              {VOICE_SETTINGS_LABELS.stability.label}
              <Tooltip content={VOICE_SETTINGS_LABELS.stability.tooltip} />
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
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              {VOICE_SETTINGS_LABELS.similarity_boost.label}
              <Tooltip content={VOICE_SETTINGS_LABELS.similarity_boost.tooltip} />
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
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              {VOICE_SETTINGS_LABELS.style.label}
              <Tooltip content={VOICE_SETTINGS_LABELS.style.tooltip} />
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
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
            {VOICE_SETTINGS_LABELS.use_speaker_boost.label}
            <Tooltip content={VOICE_SETTINGS_LABELS.use_speaker_boost.tooltip} />
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

        {/* Seed Settings */}
        <div className="pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Seed 값
              </label>
              <button
                onClick={handleGenerateRandomSeed}
                className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                title="랜덤 Seed 생성"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={seedSettings.useRandomSeed}
                  onChange={() => handleSeedToggle(true)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">랜덤</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!seedSettings.useRandomSeed}
                  onChange={() => handleSeedToggle(false)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">고정</span>
              </label>
            </div>
            
            {!seedSettings.useRandomSeed && (
              <input
                type="number"
                min="0"
                max="4294967295"
                value={seedSettings.fixedSeed}
                onChange={(e) => handleFixedSeedChange(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0 - 4294967295"
              />
            )}
            
            <div className="text-xs text-gray-500 leading-relaxed">
              동일한 seed와 설정으로 반복 요청 시 같은 결과를 얻을 수 있습니다. (완전한 보장은 아님)
            </div>
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