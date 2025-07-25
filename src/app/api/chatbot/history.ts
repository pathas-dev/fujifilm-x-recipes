import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { trimMessages } from "@langchain/core/messages";
import { ChatMessage, BaseMessage } from "@langchain/core/messages";

// 세션 ID별 채팅 히스토리를 관리하는 저장소
const chatHistories = new Map<string, InMemoryChatMessageHistory>();

// 대화 히스토리에서 허용되는 최대 토큰 수
const MAX_TOKENS = 1000;

// 세션의 채팅 히스토리를 가져오거나 생성
export function getChatHistory(sessionId: string): InMemoryChatMessageHistory {
  if (!chatHistories.has(sessionId)) {
    chatHistories.set(sessionId, new InMemoryChatMessageHistory());
  }
  return chatHistories.get(sessionId)!;
}

// 잘린 메시지로 필터링된 채팅 히스토리 생성
export async function getFilteredChatHistory(sessionId: string): Promise<InMemoryChatMessageHistory> {
  const originalHistory = getChatHistory(sessionId);
  const messages = await originalHistory.getMessages();
  
  // MAX_TOKENS 범위 내에 유지하기 위해 메시지 자르기
  const trimmedMessages = await trimMessages(messages, {
    maxTokens: MAX_TOKENS,
    strategy: "last", // 토큰 제한 내에 맞는 마지막 메시지들 유지
    tokenCounter: (messages) => {
      // 간단한 토큰 추정: 토큰당 대략 4글자
      const totalChars = messages.reduce((acc, msg) => acc + msg.content.toString().length, 0);
      return Math.ceil(totalChars / 4);
    },
  });
  
  // 잘린 메시지로 새로운 임시 히스토리 생성
  const filteredHistory = new InMemoryChatMessageHistory();
  for (const message of trimmedMessages) {
    await filteredHistory.addMessage(message);
  }
  
  return filteredHistory;
}

// 토큰 제한 내에 유지하기 위해 메시지 자르기
export async function getTrimmedMessages(sessionId: string): Promise<BaseMessage[]> {
  const history = getChatHistory(sessionId);
  const messages = await history.getMessages();
  
  // MAX_TOKENS 범위 내에 유지하기 위해 메시지 자르기
  const trimmedMessages = await trimMessages(messages, {
    maxTokens: MAX_TOKENS,
    strategy: "last", // 토큰 제한 내에 맞는 마지막 메시지들 유지
    tokenCounter: (messages) => {
      // 간단한 토큰 추정: 토큰당 대략 4글자
      const totalChars = messages.reduce((acc, msg) => acc + msg.content.toString().length, 0);
      return Math.ceil(totalChars / 4);
    },
  });
  
  return trimmedMessages;
}

// 채팅 히스토리에 메시지 추가
export async function addMessageToHistory(
  sessionId: string, 
  message: BaseMessage
): Promise<void> {
  const history = getChatHistory(sessionId);
  await history.addMessage(message);
}

// 저장을 위해 레시피 객체에서 공통 필드 추출
export function extractCommonFields(recipes: any) {
  if (!recipes) return null;
  
  const extractRecipeFields = (recipe: any) => {
    if (!recipe) return null;
    
    return {
      title: recipe.title,
      baseFilmSimulation: recipe.baseFilmSimulation,
      recommendationReason: recipe.recommendationReason,
      // 이미지 데이터 없이 기본 설정 포함
      settings: recipe.settings ? {
        filmSimulation: recipe.settings.filmSimulation,
        dynamicRange: recipe.settings.dynamicRange,
        priority: recipe.settings.priority,
      } : null,
    };
  };
  
  return {
    retrieved: extractRecipeFields(recipes.retrieved),
    generated: extractRecipeFields(recipes.generated),
  };
}

// 요청에서 IP 주소 추출
export function getClientIpAddress(request: Request): string {
  // IP 주소를 위해 다양한 헤더 시도
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for에는 여러 IP가 있을 수 있으므로 첫 번째 것을 사용
    return forwarded.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const clientIp = request.headers.get('x-client-ip');
  if (clientIp) {
    return clientIp;
  }
  
  // IP를 찾을 수 없는 경우 기본 식별자로 대체
  return 'unknown-client';
}