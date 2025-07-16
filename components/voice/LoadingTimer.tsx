"use client";

import { useEffect, useState } from 'react';

interface LoadingTimerProps {
  isLoading: boolean;
  onTimeUpdate?: (time: number) => void;
}

const LoadingTimer = ({ isLoading, onTimeUpdate }: LoadingTimerProps) => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    if (isLoading && !startTime) {
      setStartTime(Date.now());
    } else if (!isLoading) {
      setStartTime(null);
      setCurrentTime(0);
    }
  }, [isLoading, startTime]);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setCurrentTime(elapsed);
      onTimeUpdate?.(elapsed);
    }, 10);

    return () => clearInterval(interval);
  }, [startTime, onTimeUpdate]);

  if (!isLoading) return null;

  return (
    <div className="text-center py-4">
      <div className="inline-flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">
          처리 중... {(currentTime / 1000).toFixed(1)}초
        </span>
      </div>
    </div>
  );
};

export default LoadingTimer;