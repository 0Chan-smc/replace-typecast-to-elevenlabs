// Web Audio API를 사용한 스테레오 처리

// 순차적 스테레오 세그먼트 분석
export interface StereoSegment {
  startIndex: number;
  endIndex: number;
  channel: 'left' | 'right' | 'both';
  text: string;
}

export const parseSequentialStereo = (text: string): { segments: StereoSegment[]; cleanText: string } => {
  const segments: StereoSegment[] = [];
  let processedText = text;
  let currentIndex = 0;

  // [L] 태그 찾기
  const leftRegex = /\[L\](.*?)\[\/L\]/g;
  let leftMatch;
  while ((leftMatch = leftRegex.exec(text)) !== null) {
    segments.push({
      startIndex: leftMatch.index,
      endIndex: leftMatch.index + leftMatch[0].length,
      channel: 'left',
      text: leftMatch[1]
    });
  }

  // [R] 태그 찾기
  const rightRegex = /\[R\](.*?)\[\/R\]/g;
  let rightMatch;
  while ((rightMatch = rightRegex.exec(text)) !== null) {
    segments.push({
      startIndex: rightMatch.index,
      endIndex: rightMatch.index + rightMatch[0].length,
      channel: 'right',
      text: rightMatch[1]
    });
  }

  // 인덱스 순으로 정렬
  segments.sort((a, b) => a.startIndex - b.startIndex);

  // 태그되지 않은 부분 추가
  const finalSegments: StereoSegment[] = [];
  currentIndex = 0;

  for (const segment of segments) {
    // 이전 세그먼트와 현재 세그먼트 사이의 텍스트
    if (currentIndex < segment.startIndex) {
      const bothText = text.substring(currentIndex, segment.startIndex).trim();
      if (bothText) {
        finalSegments.push({
          startIndex: currentIndex,
          endIndex: segment.startIndex,
          channel: 'both',
          text: bothText
        });
      }
    }
    
    finalSegments.push(segment);
    currentIndex = segment.endIndex;
  }

  // 마지막 세그먼트 이후의 텍스트
  if (currentIndex < text.length) {
    const bothText = text.substring(currentIndex).trim();
    if (bothText) {
      finalSegments.push({
        startIndex: currentIndex,
        endIndex: text.length,
        channel: 'both',
        text: bothText
      });
    }
  }

  // 클린 텍스트 생성 (태그 제거)
  const cleanText = text
    .replace(/\[L\]/g, '')
    .replace(/\[\/L\]/g, '')
    .replace(/\[R\]/g, '')
    .replace(/\[\/R\]/g, '')
    .trim();

  return { segments: finalSegments, cleanText };
};

// ArrayBuffer를 AudioBuffer로 변환
const arrayBufferToAudioBuffer = async (arrayBuffer: ArrayBuffer, audioContext: AudioContext): Promise<AudioBuffer> => {
  return await audioContext.decodeAudioData(arrayBuffer.slice(0));
};


// AudioBuffer를 WAV Blob으로 변환
const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV 헤더 작성
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * 2, true);
  
  // 오디오 데이터 작성
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

// 텍스트 가중치 계산 (음성 시간 추정)
const calculateTextWeight = (text: string): number => {
  // 기본 가중치 (문자 길이) - 5배로 증가
  let weight = text.length * 5.0;
  
  // 공백과 구두점은 짧은 시간
  const spaceCount = (text.match(/\s/g) || []).length;
  const punctuationCount = (text.match(/[.,!?;:]/g) || []).length;
  
  // Break 태그 가중치 (실제 시간 반영)
  const breakMatches = text.match(/<break\s+time="([^"]+)"/g);
  let breakWeight = 0;
  if (breakMatches) {
    for (const match of breakMatches) {
      const timeMatch = match.match(/time="([^"]+)"/);
      if (timeMatch) {
        const timeStr = timeMatch[1];
        const timeValue = parseFloat(timeStr);
        if (!isNaN(timeValue)) {
          // 1초 = 평균 50글자 정도로 가중치 계산 (5배 적용)
          breakWeight += timeValue * 50;
        }
      }
    }
  }
  
  // 조정된 가중치 반환 (공백/구두점 가중치도 5배로)
  return weight + breakWeight - (spaceCount * 1.5) - (punctuationCount * 0.5);
};

// 순차적 스테레오 처리 함수 (단일 오디오 + 세그먼트 정보)
export const processSequentialStereo = async (
  audioBuffer: ArrayBuffer,
  segments: StereoSegment[],
  cleanText: string
): Promise<Blob> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  try {
    // 원본 오디오 디코딩
    const originalBuffer = await arrayBufferToAudioBuffer(audioBuffer, audioContext);
    
    // 스테레오 출력 버퍼 생성
    const outputBuffer = audioContext.createBuffer(2, originalBuffer.length, originalBuffer.sampleRate);
    const leftOutput = outputBuffer.getChannelData(0);
    const rightOutput = outputBuffer.getChannelData(1);
    const inputData = originalBuffer.getChannelData(0);
    
    // 전체 가중치 계산
    const totalWeight = segments.reduce((sum, segment) => sum + calculateTextWeight(segment.text), 0);
    const totalSamples = originalBuffer.length;
    
    let currentWeight = 0;
    
    for (const segment of segments) {
      // 세그먼트의 가중치 기반 시작/끝 샘플 계산
      const segmentWeight = calculateTextWeight(segment.text);
      const startSample = Math.floor((currentWeight / totalWeight) * totalSamples);
      const endSample = Math.floor(((currentWeight + segmentWeight) / totalWeight) * totalSamples);
      
      console.log(`Segment "${segment.text.substring(0, 50)}..." (${segment.channel}): weight ${segmentWeight.toFixed(1)}, samples ${startSample}-${endSample}`);
      
      // 해당 구간에 채널별 오디오 배치
      for (let i = startSample; i < endSample && i < totalSamples; i++) {
        const sample = inputData[i];
        
        switch (segment.channel) {
          case 'left':
            leftOutput[i] = sample;
            rightOutput[i] = 0; // 우측 채널 무음
            break;
          case 'right':
            leftOutput[i] = 0; // 좌측 채널 무음
            rightOutput[i] = sample;
            break;
          case 'both':
            leftOutput[i] = sample;
            rightOutput[i] = sample;
            break;
        }
      }
      
      currentWeight += segmentWeight;
    }
    
    // WAV 파일로 변환
    return audioBufferToWav(outputBuffer);
    
  } finally {
    await audioContext.close();
  }
};

