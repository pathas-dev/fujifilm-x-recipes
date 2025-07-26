# 📸 Fujifilm X Recipes v2.0.0

후지필름 X 시리즈 카메라를 위한 필름 시뮬레이션 레시피 모음 웹사이트입니다.

## 🚀 개발 환경 설정

개발 서버를 실행하려면:

```bash
pnpm dev
```

브라우저에서 [http://localhost:3500](http://localhost:3500)을 열어서 확인할 수 있습니다.

## ✨ 주요 기능

- 🤖 **AI 큐레이터**: LangChain + Google Gemini 기반 지능형 레시피 추천
- 🌍 **다국어 지원**: 한국어/영어 지원 (next-intl)
- 📱 **PWA**: 모바일 앱처럼 설치 가능
- 🎨 **Tailwind CSS v4 + DaisyUI v5**: 모던한 UI 컴포넌트
- ⚡ **Next.js 15**: 최신 React 프레임워크 (App Router)
- 🔧 **TypeScript**: 타입 안전성
- 🖼️ **실시간 이미지 처리**: Sharp 기반 필름 시뮬레이션
- 📝 **MDX 지원**: 가이드 및 패치 노트 페이지

## 🛠️ 기술 스택

### 🎨 프론트엔드

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript 5.8+
- **스타일링**: Tailwind CSS v4 + DaisyUI v5
- **국제화**: next-intl
- **상태관리**: Zustand + Immer
- **애니메이션**: Framer Motion
- **컴포넌트**: React 19

### 🤖 AI & 백엔드

- **AI 프레임워크**: LangChain + LangGraph
- **LLM**: Google Gemini (Gemini Flash, Gemini Flash Lite)
- **벡터 데이터베이스**: Pinecone
- **데이터베이스**: MongoDB
- **이미지 처리**: Sharp
- **스키마 검증**: Zod

### ⚙️ 개발 도구

- **패키지 매니저**: pnpm
- **린터**: ESLint 9
- **타입 체킹**: TypeScript

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── [locale]/          # 다국어 페이지 (next-intl)
│   │   ├── page.tsx       # AI 큐레이터 메인 페이지
│   │   ├── recipes/       # 레시피 목록
│   │   ├── cameras/       # 카메라 정보
│   │   ├── custom/        # 커스텀 레시피
│   │   ├── bookmarks/     # 북마크
│   │   ├── settings/      # 설정
│   │   ├── origins/       # 오리진 정보
│   │   ├── guide/         # 가이드 (MDX)
│   │   │   ├── ko.guide.mdx
│   │   │   └── en.guide.mdx
│   │   └── note/          # 패치 노트 (MDX)
│   │       ├── ko.note.mdx
│   │       └── en.note.mdx
│   ├── api/
│   │   ├── chatbot/       # AI 큐레이터 API
│   │   ├── recipes/       # 레시피 API
│   │   ├── cameras/       # 카메라 API
│   │   ├── origins/       # 오리진 API
│   │   └── data/          # 데이터 API
│   ├── constants/         # 상수 정의
│   ├── globals.css        # 전역 스타일 (Tailwind + DaisyUI)
│   └── actions.ts         # 서버 액션
├── components/
│   ├── chatbot/           # AI 큐레이터 컴포넌트
│   │   ├── ChatbotClient.tsx
│   │   ├── CuratedRecipeCard.tsx
│   │   ├── CuratedRecipeResponse.tsx
│   │   ├── CuratedRecipeUrlPreview.tsx
│   │   └── LoadingIndicator.tsx
│   ├── recipe/            # 레시피 컴포넌트
│   ├── camera/            # 카메라 컴포넌트
│   ├── custom/            # 커스텀 레시피 컴포넌트
│   ├── common/            # 공통 컴포넌트
│   └── settings/          # 설정 컴포넌트
├── hooks/                 # 커스텀 React 훅
├── i18n/                  # 국제화 설정 (next-intl)
├── stores/                # Zustand 스토어
│   └── camera.ts          # 카메라 상태 관리
├── types/                 # TypeScript 타입 정의
│   └── camera-schema.ts   # 카메라 스키마
├── utils/                 # 유틸리티 함수
│   └── retouchImage.ts    # 이미지 보정 유틸
└── mdx-components.tsx     # MDX 컴포넌트 설정
```

## 🔐 환경 변수 설정

AI 큐레이터 기능을 사용하려면 다음 환경 변수가 필요합니다:

```bash
# Google AI (Gemini)
GOOGLE_API_KEY=your_google_api_key

# Pinecone (벡터 검색)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
```

## 주요 설정 파일

- `next.config.ts`: Next.js 설정 (PWA, MDX, i18n)
- `tailwind.config.ts`: Tailwind CSS 설정
- `src/app/globals.css`: DaisyUI 테마 및 커스텀 스타일
- `messages/`: 다국어 번역 파일 (ko.json, en.json)
- `src/i18n/`: next-intl 국제화 설정

## 🚀 빌드 & 배포

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린팅
pnpm lint
```

## 🌟 주요 기능 상세

### 🤖 AI 큐레이터

- LangChain + Google Gemini를 활용한 자연어 처리
- Pinecone 벡터 데이터베이스를 통한 의미 기반 레시피 검색
- Sharp를 이용한 실시간 이미지 보정 미리보기
- Zod 스키마를 통한 구조화된 AI 응답 검증

### 📱 PWA 지원

- `@ducanh2912/next-pwa`를 통한 Progressive Web App 기능
- 오프라인 캐싱 및 설치 가능한 웹앱
- 모바일 최적화된 반응형 디자인

### 🌍 다국어 지원

- next-intl을 통한 한국어/영어 지원
- 동적 라우팅 기반 언어 전환
- MDX 파일의 언어별 분리 관리
