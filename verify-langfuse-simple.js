#!/usr/bin/env node

/**
 * Simple verification script for Langfuse integration
 * This tests that the integration loads without errors
 */

const path = require('path');

// Set up environment to simulate Next.js app
process.env.NODE_ENV = 'development';

// Add the src directory to the module path
const srcPath = path.join(__dirname, 'src');
require('module').globalPaths.push(srcPath);

async function verifyLangfuseIntegration() {
  console.log('🔍 Verifying Langfuse integration...\n');

  try {
    // Test 1: Check if langfuse-callback module loads
    console.log('1. Testing langfuse-callback module...');
    const { createLangfuseCallback } = require('./src/app/api/chatbot/langfuse-callback.ts');
    
    // Test with no environment variables (should return undefined)
    const callback = createLangfuseCallback('test-session');
    if (callback === undefined) {
      console.log('   ✅ Correctly returns undefined when env vars not set');
    } else {
      console.log('   ⚠️  Returns callback when env vars not set');
    }

    // Test 2: Check if LLM creation works
    console.log('\n2. Testing LLM creation...');
    const { createLLM, GoogleAIModel } = require('./src/app/api/chatbot/llm.ts');
    
    // This should work without throwing errors
    const llmWithoutTracing = createLLM(GoogleAIModel.GeminiFlash);
    console.log('   ✅ LLM creation without tracing works');
    
    const llmWithTracing = createLLM(GoogleAIModel.GeminiFlash, { 
      sessionId: 'test-session' 
    });
    console.log('   ✅ LLM creation with tracing works');

    // Test 3: Check if agent initialization works
    console.log('\n3. Testing agent initialization...');
    const { FujifilmRecipeAgent } = require('./src/app/api/chatbot/agent.ts');
    
    const agent = new FujifilmRecipeAgent('Test question', 'X-T5');
    console.log('   ✅ Agent initialization works');
    console.log(`   Session ID: ${agent.getState().sessionId}`);

    console.log('\n🎉 All tests passed! Langfuse integration is ready.');
    
    if (!process.env.LANGFUSE_SECRET_KEY) {
      console.log('\n💡 To enable Langfuse monitoring, set these environment variables:');
      console.log('   LANGFUSE_SECRET_KEY=sk-lf-...');
      console.log('   LANGFUSE_PUBLIC_KEY=pk-lf-...');
      console.log('   LANGFUSE_HOST_URL=https://cloud.langfuse.com');
    } else {
      console.log('\n✅ Langfuse environment variables detected!');
    }

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  }
}

verifyLangfuseIntegration();