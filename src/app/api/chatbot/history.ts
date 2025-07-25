import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { trimMessages } from "@langchain/core/messages";
import { ChatMessage, BaseMessage } from "@langchain/core/messages";

// Store for managing chat histories by session ID
const chatHistories = new Map<string, InMemoryChatMessageHistory>();

// Maximum tokens allowed in conversation history
const MAX_TOKENS = 1000;

// Get or create chat history for a session
export function getChatHistory(sessionId: string): InMemoryChatMessageHistory {
  if (!chatHistories.has(sessionId)) {
    chatHistories.set(sessionId, new InMemoryChatMessageHistory());
  }
  return chatHistories.get(sessionId)!;
}

// Create a filtered chat history with trimmed messages
export async function getFilteredChatHistory(sessionId: string): Promise<InMemoryChatMessageHistory> {
  const originalHistory = getChatHistory(sessionId);
  const messages = await originalHistory.getMessages();
  
  // Trim messages to stay within MAX_TOKENS
  const trimmedMessages = await trimMessages(messages, {
    maxTokens: MAX_TOKENS,
    strategy: "last", // Keep the last messages that fit within the token limit
    tokenCounter: (messages) => {
      // Simple token estimation: roughly 4 characters per token
      const totalChars = messages.reduce((acc, msg) => acc + msg.content.toString().length, 0);
      return Math.ceil(totalChars / 4);
    },
  });
  
  // Create a new temporary history with trimmed messages
  const filteredHistory = new InMemoryChatMessageHistory();
  for (const message of trimmedMessages) {
    await filteredHistory.addMessage(message);
  }
  
  return filteredHistory;
}

// Trim messages to stay within token limit
export async function getTrimmedMessages(sessionId: string): Promise<BaseMessage[]> {
  const history = getChatHistory(sessionId);
  const messages = await history.getMessages();
  
  // Trim messages to stay within MAX_TOKENS
  const trimmedMessages = await trimMessages(messages, {
    maxTokens: MAX_TOKENS,
    strategy: "last", // Keep the last messages that fit within the token limit
    tokenCounter: (messages) => {
      // Simple token estimation: roughly 4 characters per token
      const totalChars = messages.reduce((acc, msg) => acc + msg.content.toString().length, 0);
      return Math.ceil(totalChars / 4);
    },
  });
  
  return trimmedMessages;
}

// Add a message to chat history
export async function addMessageToHistory(
  sessionId: string, 
  message: BaseMessage
): Promise<void> {
  const history = getChatHistory(sessionId);
  await history.addMessage(message);
}

// Extract common fields from recipe objects for storage
export function extractCommonFields(recipes: any) {
  if (!recipes) return null;
  
  const extractRecipeFields = (recipe: any) => {
    if (!recipe) return null;
    
    return {
      title: recipe.title,
      baseFilmSimulation: recipe.baseFilmSimulation,
      recommendationReason: recipe.recommendationReason,
      // Include basic settings without image data
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

// Extract IP address from request
export function getClientIpAddress(request: Request): string {
  // Try various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for may contain multiple IPs, take the first one
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
  
  // Fallback to a default identifier if no IP is found
  return 'unknown-client';
}