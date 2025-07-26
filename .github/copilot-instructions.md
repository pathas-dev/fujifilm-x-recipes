# Fujifilm X Recipes - GitHub Copilot Instructions

이 프로젝트는 후지필름 X 시리즈 카메라를 위한 필름 시뮬레이션 레시피 웹사이트입니다. Next.js 15 기반의 TypeScript React 애플리케이션으로, AI 큐레이터 기능과 다국어 지원을 제공합니다. 기여할 때 다음 가이드라인을 따라주세요:

## 코드 표준

### 커밋 전 필수 사항

- `pnpm lint` 실행하여 ESLint 오류 해결
- TypeScript 타입 체크 통과 확인

### 개발 플로우

- 개발 서버: `pnpm dev` (포트 3500)
- 빌드: `pnpm build`
- 프로덕션 실행: `pnpm start`
- 린트: `pnpm lint`

## 프로젝트 구조

- `src/app/`: Next.js 15 App Router 기반 페이지
  - `[locale]/`: 다국어 지원 페이지들
  - `api/`: API 라우트 (AI 큐레이터, 데이터 처리)
- `src/components/`: 재사용 가능한 React 컴포넌트
  - `chatbot/`: AI 큐레이터 컴포넌트
  - `recipe/`: 레시피 관련 컴포넌트
  - `custom/`: 커스텀 레시피 에디터
  - `common/`: 공통 UI 컴포넌트
- `src/types/`: TypeScript 타입 정의
- `src/i18n/`: next-intl 기반 국제화 설정
- `src/stores/`: Zustand 상태 관리 스토어
- `src/utils/`: 유틸리티 함수들

## 핵심 가이드라인

### 1. TypeScript 및 타입 안전성

- 모든 컴포넌트와 함수는 엄격한 타입 정의 사용
- Zod 스키마를 통한 런타임 검증 활용
- `src/types/` 폴더의 기존 타입들 재사용

### 2. 스타일링 및 UI

- Tailwind CSS v4 + DaisyUI v5 사용
- 반응형 디자인 필수 (모바일 우선)
- DaisyUI 테마 시스템 활용 (light-nord, dark-dark)
- `className` 배열을 `join(" ")` 방식으로 구성

### 3. 국제화 (i18n)

- 모든 사용자 대상 텍스트는 next-intl 사용
- 한국어(`ko`), 영어(`en`) 지원
- `messages/` 폴더의 JSON 파일에 번역 텍스트 정의
- `useTranslations` 훅 활용

### 4. 상태 관리

- Zustand 사용 (예: `useToastStore`)
- 컴포넌트 레벨 상태는 React hooks 사용
- 복잡한 객체 업데이트 시 Immer `produce` 활용

### 5. AI 및 데이터 처리

- LangChain + Google Gemini 기반 AI 큐레이터
- Pinecone 벡터 데이터베이스 활용
- Zod 스키마로 AI 응답 검증

### 6. 컴포넌트 패턴

- 클라이언트 컴포넌트는 `'use client'` 지시어 사용
- props 인터페이스는 `I{ComponentName}Props` 명명
- 이벤트 핸들러는 `onEvent` 형식
- 커스텀 훅은 `use` 접두어 사용

### 7. 파일 명명 규칙

- 컴포넌트: PascalCase (예: `CustomEditCard.tsx`)
- 유틸리티: camelCase (예: `csvReader.ts`)
- 타입 정의: kebab-case (예: `recipe-schema.ts`)
- API 라우트: kebab-case (예: `route.ts`)

### 8. 성능 최적화

- Next.js Image 컴포넌트 사용
- Framer Motion으로 부드러운 애니메이션
- Sharp 라이브러리로 이미지 처리
- PWA 최적화 (next-pwa)

## 특별 고려사항

### Fujifilm 카메라 설정

- 모든 카메라 설정값은 `src/components/custom/fujiSettings.ts` 참조
- 필름 시뮬레이션 타입은 `FilmSimulationTypes` 상수 사용
- 설정 범위는 실제 후지필름 카메라 스펙 준수

### AI 큐레이터

- Google Gemini Flash/Flash Lite 모델 사용
- 응답은 구조화된 JSON 형태로 검증
- 컨텍스트는 Pinecone에서 벡터 검색으로 제공

### 다국어 처리

- 모든 메시지는 `messages/` 폴더에서 관리
- 번역키는 중첩 객체 구조로 체계적 관리
- 컴포넌트에서는 `useTranslations` 훅으로 접근

## 환경 변수

```bash
GOOGLE_API_KEY=           # Google AI API 키
PINECONE_API_KEY=         # Pinecone 벡터 DB 키
PINECONE_INDEX_NAME=      # Pinecone 인덱스명
```

## 테스트 및 품질 관리

1. TypeScript 컴파일 오류 없음
2. ESLint 규칙 준수
3. 반응형 디자인 확인 (모바일/데스크톱)
4. 다국어 텍스트 정상 표시
5. AI 기능 사용 시 적절한 오류 처리

기존 코드 패턴과 구조를 유지하며, 사용자 경험을 우선시하는 깔끔하고 효율적인 코드를 작성해주세요.
