import { CallbackHandler } from 'langfuse-langchain';

// Check if Langfuse is configured
const isLangfuseConfigured = () => {
  return (
    process.env.LANGFUSE_SECRET_KEY &&
    process.env.LANGFUSE_PUBLIC_KEY &&
    process.env.LANGFUSE_HOST_URL
  );
};

// Create Langfuse callback handler
export const createLangfuseCallback = (sessionId?: string) => {
  if (!isLangfuseConfigured()) {
    return undefined;
  }

  try {
    return new CallbackHandler({
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      baseUrl: process.env.LANGFUSE_HOST_URL,
      sessionId,
    });
  } catch (error) {
    console.warn('Failed to create Langfuse callback:', error);
    return undefined;
  }
};