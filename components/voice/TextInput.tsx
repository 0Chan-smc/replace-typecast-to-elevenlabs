"use client";

import { useState, useRef, useEffect } from 'react';
import { validateTextInput } from '@/lib/utils';
import { TEXT_LIMITS } from '@/lib/constants';
import Tooltip from '@/components/ui/Tooltip';

interface TextInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  processingTime?: number;
  processingStage?: 'api' | 'stereo' | null;
  isStereoMode?: boolean;
  defaultText?: string;
  voiceSelector?: React.ReactNode;
  selectedVoiceId?: string | null;
}

const BREAK_TAG = '<break time="1.0s" />';
const LEFT_TAG_START = '[L]';
const LEFT_TAG_END = '[/L]';
const RIGHT_TAG_START = '[R]';
const RIGHT_TAG_END = '[/R]';

const TextInput = ({ onSubmit, isLoading, processingTime, processingStage, isStereoMode, defaultText, voiceSelector, selectedVoiceId }: TextInputProps) => {
  const [text, setText] = useState(defaultText || '');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // defaultText 변경 시 텍스트 업데이트 (빈 텍스트일 때만)
  useEffect(() => {
    if (defaultText && text.trim() === '') {
      setText(defaultText);
    }
  }, [defaultText, text]);

  const handleSubmit = () => {
    const validationError = validateTextInput(text);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError(null);
    onSubmit(text);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (error) setError(null);
  };

  const insertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + tag + text.substring(end);
    
    setText(newText);
    
    // 커서를 태그 다음으로 이동
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  const handleInsertBreak = () => insertTag(BREAK_TAG);
  
  const handleInsertLeftTag = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    const taggedText = LEFT_TAG_START + selectedText + LEFT_TAG_END;
    
    const newText = text.substring(0, start) + taggedText + text.substring(end);
    setText(newText);
    
    // 커서를 태그 내부로 이동 (선택된 텍스트가 없으면 시작 태그 다음)
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + LEFT_TAG_START.length, start + LEFT_TAG_START.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + LEFT_TAG_START.length, start + LEFT_TAG_START.length);
      }
    }, 0);
  };

  const handleInsertRightTag = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    const taggedText = RIGHT_TAG_START + selectedText + RIGHT_TAG_END;
    
    const newText = text.substring(0, start) + taggedText + text.substring(end);
    setText(newText);
    
    // 커서를 태그 내부로 이동
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + RIGHT_TAG_START.length, start + RIGHT_TAG_START.length + selectedText.length);
      } else {
        textarea.setSelectionRange(start + RIGHT_TAG_START.length, start + RIGHT_TAG_START.length);
      }
    }, 0);
  };

  const remainingChars = TEXT_LIMITS.MAX_LENGTH - text.length;

  return (
    <div className="space-y-4">
      {voiceSelector && (
        <div className="mb-4">
          {voiceSelector}
        </div>
      )}
      <div>
        <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
          변환할 텍스트를 입력하세요
        </label>
        <textarea
          ref={textareaRef}
          id="text-input"
          rows={12}
          value={text}
          onChange={handleTextChange}
          className={`w-full rounded-lg border p-4 text-gray-900 focus:ring-2 focus:ring-blue-200 resize-none ${
            error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          placeholder="여기에 텍스트를 입력하세요..."
          disabled={isLoading}
        />
        <div className="flex justify-between items-center mt-1">
          <div className="text-sm text-gray-500">
            {remainingChars >= 0 ? `${remainingChars}자 남음` : `${Math.abs(remainingChars)}자 초과`}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <button
                onClick={handleInsertBreak}
                disabled={isLoading}
                className="text-xs bg-white hover:bg-gray-50 text-gray-700 border border-blue-500 px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Break 삽입
              </button>
              <Tooltip content="3초 이상은 효과가 없습니다" />
            </div>
            
            {isStereoMode && (
              <>
                <button
                  onClick={handleInsertLeftTag}
                  disabled={isLoading}
                  className="text-xs bg-white hover:bg-purple-50 text-purple-700 border border-purple-500 px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="좌측 채널 태그 삽입"
                >
                  [L] 좌측
                </button>
                <button
                  onClick={handleInsertRightTag}
                  disabled={isLoading}
                  className="text-xs bg-white hover:bg-purple-50 text-purple-700 border border-purple-500 px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="우측 채널 태그 삽입"
                >
                  [R] 우측
                </button>
              </>
            )}
            
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading || remainingChars < 0 || !selectedVoiceId}
          className={`font-medium py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            isStereoMode 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading 
            ? (processingTime 
                ? `${processingStage === 'api' ? '1단계' : processingStage === 'stereo' ? '2단계' : ''} 생성 중... ${(processingTime / 1000).toFixed(1)}초${processingStage === 'stereo' ? ' (스테레오 처리)' : processingStage === 'api' && isStereoMode ? ' (음성 생성)' : ''}` 
                : '생성 중...'
              )
            : '음성 생성'
          }
        </button>
      </div>
    </div>
  );
};

export default TextInput;