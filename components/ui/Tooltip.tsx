"use client";

import { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
}

const Tooltip = ({ content }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 ml-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="설명 보기"
      >
        <Info className="w-4 h-4" />
      </button>
      {isVisible && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 w-72 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm rounded-lg p-3 shadow-xl border border-gray-700">
            <div className="relative leading-relaxed">
              {content}
              <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-gray-900 border-b-[6px] border-b-transparent" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;