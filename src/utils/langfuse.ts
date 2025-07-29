import { CallbackHandler } from 'langfuse-langchain';

const langfuseHandler = new CallbackHandler({
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  baseUrl: process.env.LANGFUSE_BASEURL,
  flushAt: 1,
});

export default langfuseHandler;
