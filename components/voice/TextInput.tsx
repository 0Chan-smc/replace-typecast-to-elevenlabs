"use client";

import { useState, useRef } from 'react';
import { validateTextInput } from '@/lib/utils';
import { TEXT_LIMITS } from '@/lib/constants';

interface TextInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  processingTime?: number;
}

const BREAK_TAG = '<break time="1.0s" />';

const TextInput = ({ onSubmit, isLoading, processingTime }: TextInputProps) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleInsertBreak = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + BREAK_TAG + text.substring(end);
    
    setText(newText);
    
    // 커서를 break 태그 다음으로 이동
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + BREAK_TAG.length, start + BREAK_TAG.length);
    }, 0);
  };

  const remainingChars = TEXT_LIMITS.MAX_LENGTH - text.length;

  return (
    <div className="space-y-4">
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
            <button
              onClick={handleInsertBreak}
              disabled={isLoading}
              className="text-xs bg-white hover:bg-gray-50 text-gray-700 border border-blue-500 px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="1초 휴식 태그 삽입"
            >
              Break 삽입
            </button>
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading || remainingChars < 0}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading 
            ? (processingTime ? `생성 중... ${(processingTime / 1000).toFixed(1)}초` : '생성 중...')
            : '음성 생성'
          }
        </button>
      </div>
    </div>
  );
};

export default TextInput;