# Fujifilm X Recipes v2.0.0

후지필름 X 시리즈 카메라를 위한 필름 시뮬레이션 레시피 모음 웹사이트입니다.

## 개발 환경 설정

개발 서버를 실행하려면:

```bash
pnpm dev
```

브라우저에서 [http://localhost:3500](http://localhost:3500)을 열어서 확인할 수 있습니다.

## 주요 기능

- 🤖 **AI 큐레이터**: LangChain + Google Gemini 기반 지능형 레시피 추천
- 🌍 **다국어 지원**: 한국어/영어 지원
- 📱 **PWA**: 모바일 앱처럼 설치 가능
- 🎨 **Tailwind CSS + DaisyUI**: 모던한 UI 컴포넌트
- ⚡ **Next.js 15**: 최신 React 프레임워크
- 🔧 **TypeScript**: 타입 안전성
- 🖼️ **실시간 이미지 처리**: Sharp 기반 필름 시뮬레이션

## 기술 스택

### 프론트엔드

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS v4 + DaisyUI
- **국제화**: next-intl
- **상태관리**: Zustand
- **애니메이션**: Framer Motion

### AI & 백엔드

- **AI 프레임워크**: LangChain
- **LLM**: Google Gemini (Gemini Flash, Gemini Flash Lite)
- **벡터 데이터베이스**: Pinecone
- **데이터베이스**: MongoDB
- **이미지 처리**: Sharp
- **스키마 검증**: Zod

### 개발 도구

- **패키지 매니저**: pnpm
- **린터**: ESLint
- **타입 체킹**: TypeScript

## 프로젝트 구조

```
src/
├── app/
│   ├── [locale]/          # 다국어 페이지
│   │   ├── chatbot/       # AI 큐레이터 페이지
│   │   ├── recipes/       # 레시피 목록
│   │   ├── cameras/       # 카메라 정보
│   │   ├── custom/        # 커스텀 레시피
│   │   ├── bookmarks/     # 북마크
│   │   ├── settings/      # 설정
│   │   ├── guide/         # 가이드
│   │   └── note/          # 패치 노트
│   ├── api/
│   │   ├── chatbot/       # AI 큐레이터 API
│   │   ├── recipes/       # 레시피 API
│   │   ├── cameras/       # 카메라 API
│   │   └── data/          # 데이터 API
│   └── globals.css        # 전역 스타일
├── components/
│   ├── chatbot/           # AI 큐레이터 컴포넌트
│   ├── recipe/            # 레시피 컴포넌트
│   ├── camera/            # 카메라 컴포넌트
│   ├── custom/            # 커스텀 레시피 컴포넌트
│   ├── common/            # 공통 컴포넌트
│   └── settings/          # 설정 컴포넌트
├── i18n/                  # 국제화 설정
├── stores/                # Zustand 스토어
├── types/                 # TypeScript 타입 정의
└── utils/                 # 유틸리티 함수
```

## 환경 변수 설정

AI 큐레이터 기능을 사용하려면 다음 환경 변수가 필요합니다:

```bash
# Google AI
GOOGLE_API_KEY=your_google_api_key

# Pinecone (벡터 검색)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
```

## 빌드 & 배포

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```
