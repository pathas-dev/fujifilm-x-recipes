# Fujifilm X Recipes

후지필름 X 시리즈 카메라를 위한 필름 시뮬레이션 레시피 모음 웹사이트입니다.

## 개발 환경 설정

개발 서버를 실행하려면:

```bash
pnpm dev
```

브라우저에서 [http://localhost:3500](http://localhost:3500)을 열어서 확인할 수 있습니다.

## 주요 기능

- 🌍 **다국어 지원**: 한국어/영어 지원
- 📱 **PWA**: 모바일 앱처럼 설치 가능
- 🎨 **Tailwind CSS + DaisyUI**: 모던한 UI 컴포넌트
- ⚡ **Next.js 15**: 최신 React 프레임워크
- 🔧 **TypeScript**: 타입 안전성

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS v4 + DaisyUI
- **국제화**: next-intl
- **상태관리**: Zustand
- **애니메이션**: Framer Motion
- **패키지 매니저**: pnpm

## 프로젝트 구조

```
src/
├── app/           # App Router 페이지
├── components/    # 재사용 가능한 컴포넌트
├── i18n/         # 국제화 설정
├── stores/       # Zustand 스토어
└── types/        # TypeScript 타입 정의
```

## 빌드 & 배포

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```
