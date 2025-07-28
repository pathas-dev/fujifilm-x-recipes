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
  - `[locale]/`: 다국어 지원 페이지들 (ko, en)
  - `api/`: API 라우트 (AI 큐레이터, 데이터 처리)
    - `chatbot/`: AI 큐레이터 API (LangChain + Google Gemini)
    - `recipes/`: 레시피 관련 API
    - `cameras/`: 카메라 정보 API
- `src/components/`: 재사용 가능한 React 컴포넌트
  - `chatbot/`: AI 큐레이터 컴포넌트
    - `ChatbotClient.tsx`: 메인 채팅 인터페이스
    - `ChatbotHistory.tsx`: 대화 기록 관리
    - `useChatMessages.ts`: 채팅 상태 관리 훅
    - `CuratedRecipe/`: 큐레이션된 레시피 컴포넌트들
  - `recipe/`: 레시피 관련 컴포넌트
  - `custom/`: 커스텀 레시피 에디터
  - `common/`: 공통 UI 컴포넌트 (ConfirmModal 등)
  - `camera/`: 카메라 정보 컴포넌트
  - `settings/`: 설정 관련 컴포넌트
- `src/types/`: TypeScript 타입 정의
  - `recipe-schema.ts`: 레시피 관련 Zod 스키마
  - `camera-schema.ts`: 카메라 및 센서 타입 정의
- `src/i18n/`: next-intl 기반 국제화 설정
- `src/stores/`: Zustand 상태 관리 스토어
  - `chat.ts`: 채팅 상태 관리
  - `customRecipe.ts`: 커스텀 레시피 상태 관리
- `src/utils/`: 유틸리티 함수들
  - `retouchImage.ts`: Sharp 기반 이미지 보정
  - `csvReader.ts`: Papa Parse를 이용한 CSV 읽기
  - `parse.ts`: 레시피 데이터 파싱 및 벡터화
- `messages/`: 다국어 번역 파일 (ko.json, en.json)

## 핵심 가이드라인

### 1. TypeScript 및 타입 안전성

- 모든 컴포넌트와 함수는 엄격한 타입 정의 사용
- Zod 스키마를 통한 런타임 검증 활용 (`CuratedRecipesSchema`, `QuestionAnalysisSchema` 등)
- `src/types/` 폴더의 기존 타입들 재사용
- 센서 타입과 카메라 모델 매핑은 `SENSOR_CAMERA_MAPPINGS` 활용

### 2. 스타일링 및 UI

- Tailwind CSS v4 + DaisyUI v5 사용
- 반응형 디자인 필수 (모바일 우선)
- DaisyUI 테마 시스템 활용 (light-nord, dark-dark)
- `className` 배열을 `join(" ")` 방식으로 구성
- Framer Motion을 활용한 부드러운 애니메이션 효과

### 3. 국제화 (i18n)

- 모든 사용자 대상 텍스트는 next-intl 사용
- 한국어(`ko`), 영어(`en`) 지원
- `messages/` 폴더의 JSON 파일에 번역 텍스트 정의
- `useTranslations` 훅 활용
- MDX 파일도 언어별 분리 (`ko.guide.mdx`, `en.guide.mdx`)

### 4. 상태 관리

- Zustand 사용 (예: `useToastStore`, `useChatStore`)
- 컴포넌트 레벨 상태는 React hooks 사용
- 복잡한 객체 업데이트 시 Immer `produce` 활용
- 채팅 기록은 로컬스토리지와 연동

### 5. AI 및 데이터 처리

- LangChain + Google Gemini 기반 AI 큐레이터
- Google Gemini Flash/Flash Lite 모델 사용
- Pinecone 벡터 데이터베이스 활용 (의미 기반 레시피 검색)
- Zod 스키마로 AI 응답 검증
- 단계별 처리: 질문 분석 → 문서 검색 → 레시피 생성 → 이미지 처리
- `FujifilmRecipeAgent` 클래스로 AI 워크플로우 관리

### 6. 컴포넌트 패턴

- 클라이언트 컴포넌트는 `'use client'` 지시어 사용
- props 인터페이스는 `I{ComponentName}Props` 명명
- 이벤트 핸들러는 `onEvent` 형식
- 커스텀 훅은 `use` 접두어 사용
- Portal을 활용한 효율적인 모달 렌더링

### 7. 파일 명명 규칙

- 컴포넌트: PascalCase (예: `CustomEditCard.tsx`)
- 유틸리티: camelCase (예: `csvReader.ts`)
- 타입 정의: kebab-case (예: `recipe-schema.ts`)
- API 라우트: kebab-case (예: `route.ts`)
- MDX 파일: `{locale}.{type}.mdx` (예: `ko.guide.mdx`)

### 8. 성능 최적화

- Next.js Image 컴포넌트 사용
- Framer Motion으로 부드러운 애니메이션
- Sharp 라이브러리로 이미지 처리 및 필름 시뮬레이션
- PWA 최적화 (@ducanh2912/next-pwa)
- LLM 인스턴스 캐싱으로 메모리 효율성 향상
- 이미지 처리 병렬화로 성능 개선

## 특별 고려사항

### Fujifilm 카메라 설정

- 모든 카메라 설정값은 `src/components/custom/fujiSettings.ts` 참조
- 필름 시뮬레이션 타입은 `FilmSimulationTypes` 상수 사용
- 설정 범위는 실제 후지필름 카메라 스펙 준수
- 센서별 호환성은 `SENSOR_CAMERA_MAPPINGS` 기반으로 판단

### AI 큐레이터 워크플로우

- 4단계 처리: `analyzing` → `searching` → `generating` → `processing`
- 성능 측정 및 로깅 (`measureTime` 헬퍼 활용)
- 관련 없는 질문에 대한 거부 응답 처리
- 실시간 이미지 보정 미리보기 (Sharp 기반)
- 카메라 모델 표시 및 원본 레시피 연동

### 이미지 처리

- Sharp를 이용한 필름 시뮬레이션 적용
- 순차 적용 방식: 필름 시뮬레이션 → 사용자 설정 → 흑백 변환
- WebP 포맷 최적화 및 Base64 인코딩 지원
- 보정 전후 이미지 비교 슬라이더 제공

### 다국어 처리

- 모든 메시지는 `messages/` 폴더에서 관리
- 번역키는 중첩 객체 구조로 체계적 관리
- 컴포넌트에서는 `useTranslations` 훅으로 접근
- AI 응답도 사용자 언어에 맞춰 제공

### 데이터 관리

- CSV 파일 기반 레시피 데이터 관리 (Papa Parse)
- Pinecone 벡터 데이터베이스 인덱싱
- 로컬스토리지 기반 북마크 및 커스텀 레시피 저장
- 공유 URL을 통한 레시피 공유 기능

## 환경 변수

```bash
GOOGLE_API_KEY=           # Google AI API 키 (Gemini)
PINECONE_API_KEY=         # Pinecone 벡터 DB 키
PINECONE_INDEX_NAME=      # Pinecone 인덱스명
MONGODB_URI=              # MongoDB 연결 문자열 (선택사항)
```

## 개발 및 배포

### 주요 스크립트

- `pnpm dev`: 개발 서버 실행 (포트 3500)
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 프로덕션 서버 실행
- `pnpm lint`: ESLint 실행

### 기술 스택

**프론트엔드:**
- Next.js 15 (App Router)
- TypeScript 5.8+
- Tailwind CSS v4 + DaisyUI v5
- Framer Motion
- next-intl (국제화)

**AI & 백엔드:**
- LangChain + LangGraph
- Google Gemini (Flash, Flash Lite)
- Pinecone (벡터 검색)
- Sharp (이미지 처리)
- Zod (스키마 검증)

**개발 도구:**
- ESLint 9
- pnpm
- MDX

## 테스트 및 품질 관리

1. TypeScript 컴파일 오류 없음
2. ESLint 규칙 준수
3. 반응형 디자인 확인 (모바일/데스크톱)
4. 다국어 텍스트 정상 표시
5. AI 기능 사용 시 적절한 오류 처리
6. 이미지 처리 성능 최적화
7. PWA 기능 정상 동작

## 주요 업데이트 (v2.1.0)

- AI 큐레이터가 메인 페이지로 이동
- 대화 기록 관리 개선 (`ConfirmModal` 컴포넌트 분리)
- 카메라 모델 표시 기능 추가
- 이미지 비교 슬라이더 개선
- 컴포넌트 구조 최적화 및 모듈화
