import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// 스테레오 태그 파싱 타입
export interface StereoSegment {
  text: string;
  channel: 'left' | 'right' | 'both';
  startIndex: number;
  endIndex: number;
}

// FFmpeg 인스턴스 (싱글톤)
let ffmpegInstance: FFmpeg | null = null;

// FFmpeg 초기화
export const initFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();
  
  // WASM 파일 로드
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
};

// 텍스트에서 스테레오 태그 파싱
export const parseTextForStereo = (text: string): StereoSegment[] => {
  const segments: StereoSegment[] = [];
  const leftTagRegex = /\[L\](.*?)\[\/L\]/gs;
  const rightTagRegex = /\[R\](.*?)\[\/R\]/gs;
  
  let processedText = text;
  let offset = 0;

  // 왼쪽 채널 태그 처리
  let leftMatch;
  while ((leftMatch = leftTagRegex.exec(text)) !== null) {
    const startIndex = leftMatch.index;
    const endIndex = leftMatch.index + leftMatch[0].length;
    const segmentText = leftMatch[1];
    
    segments.push({
      text: segmentText,
      channel: 'left',
      startIndex,
      endIndex,
    });
  }

  // 오른쪽 채널 태그 처리
  let rightMatch;
  while ((rightMatch = rightTagRegex.exec(text)) !== null) {
    const startIndex = rightMatch.index;
    const endIndex = rightMatch.index + rightMatch[0].length;
    const segmentText = rightMatch[1];
    
    segments.push({
      text: segmentText,
      channel: 'right',
      startIndex,
      endIndex,
    });
  }

  // 시작 인덱스 기준으로 정렬
  segments.sort((a, b) => a.startIndex - b.startIndex);

  // 태그되지 않은 부분도 추가 (both 채널)
  let currentIndex = 0;
  const finalSegments: StereoSegment[] = [];

  for (const segment of segments) {
    // 이전 세그먼트와 현재 세그먼트 사이의 텍스트
    if (currentIndex < segment.startIndex) {
      const bothText = text.substring(currentIndex, segment.startIndex).trim();
      if (bothText) {
        finalSegments.push({
          text: bothText,
          channel: 'both',
          startIndex: currentIndex,
          endIndex: segment.startIndex,
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
        text: bothText,
        channel: 'both',
        startIndex: currentIndex,
        endIndex: text.length,
      });
    }
  }

  return finalSegments;
};

// 태그 제거된 클린 텍스트 반환
export const getCleanText = (text: string): string => {
  return text
    .replace(/\[L\]/g, '')
    .replace(/\[\/L\]/g, '')
    .replace(/\[R\]/g, '')
    .replace(/\[\/R\]/g, '')
    .trim();
};

// 스테레오 오디오 생성
export const createStereoAudio = async (audioBuffer: ArrayBuffer): Promise<Blob> => {
  const ffmpeg = await initFFmpeg();
  
  // 입력 파일을 FFmpeg 가상 파일 시스템에 쓰기
  await ffmpeg.writeFile('input.mp3', new Uint8Array(audioBuffer));
  
  // 스테레오 변환 명령 실행
  // 모노 오디오를 스테레오로 변환하고 좌우 채널 볼륨 조정
  await ffmpeg.exec([
    '-i', 'input.mp3',
    '-filter_complex', 
    '[0:a]pan=stereo|c0=0.7*c0|c1=0.3*c0[a]',
    '-map', '[a]',
    '-codec:a', 'mp3',
    '-b:a', '128k',
    'output.mp3'
  ]);
  
  // 결과 파일 읽기
  const data = await ffmpeg.readFile('output.mp3');
  
  // 임시 파일 정리
  await ffmpeg.deleteFile('input.mp3');
  await ffmpeg.deleteFile('output.mp3');
  
  return new Blob([data], { type: 'audio/mpeg' });
};

// 채널별 오디오 생성 (좌측/우측 전용)
export const createChannelAudio = async (
  audioBuffer: ArrayBuffer, 
  channel: 'left' | 'right'
): Promise<Blob> => {
  const ffmpeg = await initFFmpeg();
  
  await ffmpeg.writeFile('input.mp3', new Uint8Array(audioBuffer));
  
  // 채널별 볼륨 설정
  const leftVolume = channel === 'left' ? '1.0' : '0.3';
  const rightVolume = channel === 'right' ? '1.0' : '0.3';
  
  await ffmpeg.exec([
    '-i', 'input.mp3',
    '-filter_complex', 
    `[0:a]pan=stereo|c0=${leftVolume}*c0|c1=${rightVolume}*c0[a]`,
    '-map', '[a]',
    '-codec:a', 'mp3',
    '-b:a', '128k',
    'output.mp3'
  ]);
  
  const data = await ffmpeg.readFile('output.mp3');
  
  await ffmpeg.deleteFile('input.mp3');
  await ffmpeg.deleteFile('output.mp3');
  
  return new Blob([data], { type: 'audio/mpeg' });
};