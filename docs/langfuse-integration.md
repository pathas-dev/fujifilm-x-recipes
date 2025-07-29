# Langfuse Monitoring Integration

이 문서는 Fujifilm X Recipes 프로젝트에 통합된 Langfuse 모니터링 기능에 대해 설명합니다.

## 개요

Langfuse는 LLM 애플리케이션의 관찰 가능성과 분석을 위한 오픈소스 플랫폼입니다. 이 통합을 통해 AI 큐레이터의 LLM 호출을 추적하고 모니터링할 수 있습니다.

## 환경 변수 설정

Langfuse 모니터링을 활성화하려면 다음 환경 변수를 설정하세요:

```bash
LANGFUSE_SECRET_KEY=sk-lf-...    # Langfuse Secret Key
LANGFUSE_PUBLIC_KEY=pk-lf-...    # Langfuse Public Key  
LANGFUSE_HOST_URL=https://cloud.langfuse.com  # Langfuse Host URL (EU region)
# 또는 US region: https://us.cloud.langfuse.com
```

### Langfuse 계정 설정

1. [Langfuse Cloud](https://cloud.langfuse.com)에서 계정 생성
2. 새 프로젝트 생성
3. Settings > API Keys에서 키 생성
4. 환경 변수에 키 설정

## 추적되는 작업

현재 다음 LLM 호출이 추적됩니다:

### 1. 질문 분석 (Question Analysis)
- **트레이스 이름**: `question-analysis`
- **모델**: Gemini Flash Lite
- **메타데이터**: 
  - 카메라 모델
  - 감지된 센서
  - 사용자 질문
  - 분석 단계

### 2. 레시피 생성 (Recipe Generation)  
- **트레이스 이름**: `recipe-generation`
- **모델**: Gemini Flash
- **메타데이터**:
  - 카메라 모델 및 센서
  - 사용자 질문 및 분석 결과
  - 검색된 문서 수
  - 생성 단계

## 세션 추적

각 AI 에이전트 인스턴스는 고유한 세션 ID를 가지며, 모든 관련 트레이스가 연결됩니다:

```
세션 형식: recipe-agent-{timestamp}-{random}
예시: recipe-agent-1706123456789-abc123def
```

## 성능 영향

- **환경 변수 미설정 시**: 완전히 비활성화, 성능 영향 없음
- **환경 변수 설정 시**: 최소한의 오버헤드로 트레이싱 활성화

## 코드 예시

### 환경 변수 확인

```typescript
import { isLangfuseEnabled } from '@/app/api/chatbot/langfuse';

if (isLangfuseEnabled()) {
  console.log('Langfuse 모니터링이 활성화되었습니다');
}
```

### 수동 콜백 핸들러 생성

```typescript
import { createLangfuseCallbackHandler } from '@/app/api/chatbot/langfuse';

const handler = createLangfuseCallbackHandler(
  'custom-trace',
  'session-123',
  'user-456',
  { custom: 'metadata' }
);

// LangChain invoke 시 사용
await chain.invoke(input, { callbacks: handler ? [handler] : [] });
```

## 트러블슈팅

### 트레이스가 보이지 않는 경우
1. 환경 변수가 올바르게 설정되었는지 확인
2. Langfuse 프로젝트 설정 확인
3. 네트워크 연결 상태 확인
4. 브라우저 개발자 도구에서 오류 로그 확인

### 성능 문제
- Langfuse는 비동기적으로 동작하므로 일반적으로 성능 영향이 최소화됩니다
- 필요 시 환경 변수를 제거하여 완전히 비활성화 가능

## 관련 파일

- `src/app/api/chatbot/langfuse.ts` - Langfuse 유틸리티 함수
- `src/app/api/chatbot/llm.ts` - LLM 생성 및 트레이싱 옵션
- `src/app/api/chatbot/agent.ts` - AI 에이전트 트레이싱 통합

## 추가 정보

- [Langfuse 공식 문서](https://langfuse.com/docs)
- [LangChain 통합 가이드](https://langfuse.com/docs/integrations/langchain)
- [Langfuse JavaScript SDK](https://langfuse.com/docs/sdk/typescript)