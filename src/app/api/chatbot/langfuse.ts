import { CallbackManager } from '@langchain/core/callbacks';
import { LangfuseCallbackHandler } from 'langfuse-langchain';

/**
 * Langfuse 설정 인터페이스
 */
interface LangfuseConfig {
  secretKey: string;
  publicKey: string;
  baseUrl: string;
}

/**
 * 환경 변수에서 Langfuse 설정을 가져오는 함수
 */
export function getLangfuseConfig(): LangfuseConfig | null {
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const baseUrl = process.env.LANGFUSE_HOST_URL;

  if (!secretKey || !publicKey || !baseUrl) {
    return null;
  }

  return {
    secretKey,
    publicKey,
    baseUrl,
  };
}

/**
 * Langfuse가 활성화되어 있는지 확인하는 함수
 */
export function isLangfuseEnabled(): boolean {
  return getLangfuseConfig() !== null;
}

/**
 * Langfuse 콜백 핸들러를 생성하는 함수
 */
export function createLangfuseCallbackHandler(
  traceName?: string,
  sessionId?: string,
  userId?: string,
  metadata?: Record<string, any>
): LangfuseCallbackHandler | null {
  const config = getLangfuseConfig();
  
  if (!config) {
    console.log('Langfuse not configured, skipping tracing');
    return null;
  }

  try {
    const handler = new LangfuseCallbackHandler({
      secretKey: config.secretKey,
      publicKey: config.publicKey,
      baseUrl: config.baseUrl,
      traceName,
      sessionId,
      userId,
      metadata,
    });

    console.log(`🔍 Langfuse callback handler created for trace: ${traceName}`);
    return handler;
  } catch (error) {
    console.error('Failed to create Langfuse callback handler:', error);
    return null;
  }
}

/**
 * Langfuse 콜백 매니저를 생성하는 함수
 */
export function createLangfuseCallbackManager(
  traceName?: string,
  sessionId?: string,
  userId?: string,
  metadata?: Record<string, any>
): CallbackManager {
  const langfuseHandler = createLangfuseCallbackHandler(
    traceName,
    sessionId,
    userId,
    metadata
  );

  const callbacks = langfuseHandler ? [langfuseHandler] : [];
  
  return CallbackManager.fromHandlers(callbacks);
}