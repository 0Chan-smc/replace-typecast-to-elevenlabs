# Voice AI MVP

ElevenLabs API를 사용한 텍스트 음성 변환 서비스입니다.

## 주요 기능

- 텍스트 입력 및 음성 변환
- 실시간 처리 시간 표시
- 오디오 재생 및 컨트롤
- 음성 파일 다운로드
- 반응형 디자인

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: TailwindCSS, Shadcn UI
- **AI Voice**: ElevenLabs API
- **Deployment**: Vercel

## 개발 환경 설정

1. 의존성 설치:

```bash
npm install
```

2. 환경 변수 설정:
   `.env.local` 파일을 생성하고 ElevenLabs API 키를 설정하세요:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

3. 개발 서버 실행:

```bash
npm run dev
```

4. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 검사
- `npm run typecheck` - TypeScript 타입 검사

## API 설정

ElevenLabs API 설정:

- Voice ID: `Fcu5ohsG7HuIwJZBxrun`
- Model: `eleven_multilingual_v2`
- Output Format: `mp3_44100_128`

## 프로젝트 구조

```
├── app/                 # Next.js App Router
│   ├── api/            # API 라우트
│   ├── globals.css     # 전역 스타일
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 메인 페이지
├── components/         # React 컴포넌트
│   ├── ui/            # 공통 UI 컴포넌트
│   └── voice/         # 음성 관련 컴포넌트
├── lib/               # 유틸리티 함수
├── types/             # TypeScript 타입 정의
└── public/            # 정적 파일
```
