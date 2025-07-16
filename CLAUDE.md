# Voice AI MVP Project — Claude Project Guide

## Project Overview

A simple MVP Voice AI application that converts text to speech using ElevenLabs API. The app features a clean interface with text input, real-time processing feedback, audio playback with timing visualization, and download functionality.

## Core Features

- **Text Input**: Simple textarea for text-to-speech conversion
- **Real-time Processing**: Display conversion delay in milliseconds
- **Audio Playback**: Full controls (play/pause/seek) for generated speech
- **Timing Visualization**: Display timestamps/subtitles synchronized with audio
- **File Download**: Save generated MP3 files locally
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: TailwindCSS 3, Shadcn UI
- **AI Voice**: ElevenLabs API
- **Analytics**: Vercel Analytics
- **Deployment**: Vercel
- **Aliases**: `@/components`, `@/lib`, `@/types`

## ElevenLabs API Configuration

### API Details
- **Voice Model ID**: `Fcu5ohsG7HuIwJZBxrun`
- **Model**: `eleven_multilingual_v2`
- **Output Format**: `mp3_44100_128`
- **Endpoint**: `/v1/text-to-speech/:voice_id/stream`
- **API Key**: Environment variable (pre-configured)

### API Integration Example
```typescript
const generateSpeech = async (text: string) => {
  const startTime = Date.now();
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/Fcu5ohsG7HuIwJZBxrun/stream?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2"
      })
    }
  );
  
  const endTime = Date.now();
  const processingTime = endTime - startTime;
  
  return { response, processingTime };
};
```

## Architecture & Structure

- **Single Page App**: Main interface on homepage
- **API Routes**: `/api/text-to-speech` for ElevenLabs integration
- **Components**: Modular UI components for voice features
- **Utils**: Audio processing and timing utilities
- **Types**: TypeScript definitions for API responses

## Coding Style Guidelines

### React Components
- **Always use arrow functions**: `const ComponentName = () => {}`
- **Use consts instead of functions** with proper TypeScript types
- **Early returns** for conditional rendering
- **Event handlers** with `handle` prefix

```tsx
const VoiceGenerator = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  
  if (isLoading) {
    return <LoadingSpinner processingTime={processingTime} />;
  }
  
  const handleTextSubmit = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    // API call logic
  };
  
  return (
    <div className="mx-auto max-w-4xl p-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-lg border p-4"
        placeholder="변환할 텍스트를 입력하세요..."
      />
      <button
        onClick={handleTextSubmit}
        disabled={!text.trim() || isLoading}
        className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white disabled:opacity-50"
      >
        음성 생성
      </button>
    </div>
  );
};
```

### Naming Conventions
- **Korean-friendly naming** for user-facing elements
- **English naming** for technical functions
- **Event handlers**: `handleSubmit`, `handlePlayback`
- **State variables**: Descriptive and clear
- **API functions**: Prefixed with action (`generateSpeech`, `downloadAudio`)

### Code Quality
- **DRY principle** for audio handling logic
- **Type safety** for API responses and audio states
- **Error handling** for API failures and network issues
- **Performance optimization** for audio processing

### HTML & Accessibility
- **Semantic HTML** for audio controls
- **ARIA labels** for screen readers
- **Keyboard navigation** for all controls
- **Focus management** for loading states

```tsx
const AudioPlayer = ({ audioUrl, timestamps }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      handlePlayPause();
    }
  };
  
  return (
    <div 
      className="rounded-lg border p-4"
      role="region" 
      aria-label="오디오 플레이어"
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        className="w-full"
        controls
        aria-label="생성된 음성 파일"
      />
      <div 
        className="mt-4"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="오디오 컨트롤"
      >
        {/* Custom controls */}
      </div>
    </div>
  );
};
```

### Styling Guidelines
- **TailwindCSS only** - No CSS files
- **Responsive design** - Mobile-first approach
- **Loading states** - Clear visual feedback
- **Audio controls** - Custom styling with Tailwind

## File Organization

```
app/
├── globals.css           # Tailwind imports
├── layout.tsx           # Root layout
├── page.tsx             # Main voice interface
└── api/
    └── text-to-speech/
        └── route.ts     # ElevenLabs API integration
components/
├── ui/                  # Shadcn UI components
├── voice/               # Voice-specific components
│   ├── TextInput.tsx    # Text input with validation
│   ├── AudioPlayer.tsx  # Audio playback controls
│   ├── TimingDisplay.tsx # Timestamp visualization
│   ├── LoadingTimer.tsx # Processing time display
│   └── DownloadButton.tsx # File download functionality
└── layout/
    ├── Header.tsx       # App header
    └── Footer.tsx       # App footer
lib/
├── utils.ts             # General utilities
├── audio-utils.ts       # Audio processing functions
├── api-client.ts        # ElevenLabs API client
└── constants.ts         # App configuration
types/
├── index.ts             # Common types
├── audio.ts             # Audio-related types
└── api.ts               # ElevenLabs API types
```

## API Integration Guidelines

### Environment Variables
```bash
ELEVENLABS_API_KEY=sk_your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### API Route Structure
```typescript
// app/api/text-to-speech/route.ts
export const POST = async (request: Request) => {
  try {
    const { text } = await request.json();
    
    const startTime = Date.now();
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/Fcu5ohsG7HuIwJZBxrun/stream?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2"
        })
      }
    );
    
    const processingTime = Date.now() - startTime;
    
    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'X-Processing-Time': processingTime.toString()
      }
    });
  } catch (error) {
    return Response.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
};
```

### TypeScript Types
```typescript
// types/api.ts
export interface SpeechRequest {
  text: string;
}

export interface SpeechResponse {
  audioUrl: string;
  processingTime: number;
  timestamps?: TimestampData[];
}

export interface TimestampData {
  start: number;
  end: number;
  text: string;
}

// types/audio.ts
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}
```

## Core Features Implementation

### 1. Real-time Processing Timer
```typescript
const useProcessingTimer = () => {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      setCurrentTime(Date.now() - startTime);
    }, 10); // Update every 10ms for smooth timer
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  const startTimer = () => setStartTime(Date.now());
  const stopTimer = () => setStartTime(null);
  
  return { currentTime, startTimer, stopTimer };
};
```

### 2. Audio Download Functionality
```typescript
const downloadAudio = (audioBlob: Blob, filename: string) => {
  const url = URL.createObjectURL(audioBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.mp3`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
```

### 3. Timestamp Visualization
```typescript
const TimingDisplay = ({ timestamps, currentTime }: TimingDisplayProps) => {
  const activeIndex = timestamps.findIndex(
    (ts) => currentTime >= ts.start && currentTime <= ts.end
  );
  
  return (
    <div className="mt-4 rounded-lg bg-gray-50 p-4">
      {timestamps.map((timestamp, index) => (
        <div
          key={index}
          className={cn(
            "py-1 px-2 rounded transition-colors",
            index === activeIndex ? "bg-blue-100 text-blue-800" : "text-gray-600"
          )}
        >
          <span className="text-sm font-mono">
            {formatTime(timestamp.start)} - {formatTime(timestamp.end)}
          </span>
          <span className="ml-2">{timestamp.text}</span>
        </div>
      ))}
    </div>
  );
};
```

## Error Handling Patterns

### API Error Handling
```typescript
const handleApiError = (error: Error) => {
  console.error('ElevenLabs API Error:', error);
  
  if (error.message.includes('rate limit')) {
    return '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
  }
  
  if (error.message.includes('authentication')) {
    return 'API 인증에 실패했습니다.';
  }
  
  return '음성 생성 중 오류가 발생했습니다. 다시 시도해주세요.';
};
```

### User Input Validation
```typescript
const validateTextInput = (text: string): string | null => {
  if (!text.trim()) {
    return '텍스트를 입력해주세요.';
  }
  
  if (text.length > 5000) {
    return '텍스트는 5000자 이하로 입력해주세요.';
  }
  
  return null;
};
```

## Performance Optimization

### Audio Blob Management
- Use `URL.createObjectURL()` for audio playback
- Clean up blob URLs with `URL.revokeObjectURL()`
- Implement audio caching for repeated requests

### Loading States
- Show processing time in real-time
- Provide clear feedback during API calls
- Disable submit button during processing

## Development Workflow

### Code Quality
- **TypeScript strict mode** enabled
- **Error boundaries** for audio components
- **Loading states** for all async operations

### Testing Strategy
- **API integration tests** for ElevenLabs endpoints
- **Audio playback tests** for cross-browser compatibility
- **Error handling tests** for network failures

## Claude Interaction Guidelines

### Language Preference
- **Claude responds in Korean** for all communications
- **Comments and documentation** in Korean when helpful
- **Error messages** displayed to users in Korean
- **Variable names** can remain in English for technical clarity

### Commit Message Guidelines
- **No "Claude Code" mentions** in commit messages
- Use descriptive, conventional commits
- Focus on feature/fix descriptions

```bash
# Good commit messages
feat: 오디오 플레이어 컴포넌트 추가
fix: ElevenLabs API 응답 처리 개선
style: 타이밍 디스플레이 UI 개선

# Avoid
feat: Claude Code로 오디오 플레이어 추가
```

## Common Tasks

### Adding New Voice Features
1. Update types in `types/audio.ts`
2. Create component in `components/voice/`
3. Add API integration if needed
4. Update main page layout
5. Test audio functionality

### API Configuration Updates
1. Update environment variables
2. Modify API client in `lib/api-client.ts`
3. Update type definitions
4. Test API integration

### UI/UX Improvements
1. Update components with new features
2. Ensure accessibility compliance
3. Test responsive design
4. Optimize for mobile usage

## Don't Modify Without Discussion
- ElevenLabs API configuration and endpoints
- Audio format specifications (mp3_44100_128)
- Voice model ID (Fcu5ohsG7HuIwJZBxrun)
- Core audio processing logic

## Questions to Ask When Uncertain

### User Experience
- 텍스트 길이 제한은 어느 정도로 설정할까요?
- 사용자 피드백 수집 방법은 무엇인가요?

### Business Logic
- API 사용량 모니터링이 필요한가요?
- 오디오 파일 저장 정책은 무엇인가요?
- 분석 데이터 수집 범위는 어디까지인가요?
