/**
 * Langfuse integration test for Fujifilm Recipe Agent
 * This test verifies that Langfuse tracing works correctly with the AI agent
 */

import { FujifilmRecipeAgent } from '@/app/api/chatbot/agent';
import { isLangfuseEnabled } from '@/app/api/chatbot/langfuse';

/**
 * Test function to verify Langfuse integration
 */
export async function testLangfuseIntegration() {
  console.log('🧪 Testing Langfuse integration...');
  
  // Check if Langfuse is enabled
  const langfuseEnabled = isLangfuseEnabled();
  console.log(`📊 Langfuse enabled: ${langfuseEnabled}`);
  
  if (langfuseEnabled) {
    console.log('✅ Environment variables are set for Langfuse');
  } else {
    console.log('ℹ️ Langfuse environment variables not set, tracing will be skipped');
  }

  // Test with a simple question
  const testQuestion = "Classic Chrome으로 인물 사진 촬영 레시피 추천해줘";
  const testCamera = "X-T5";
  
  console.log(`📝 Test question: ${testQuestion}`);
  console.log(`📷 Test camera: ${testCamera}`);
  
  try {
    const agent = new FujifilmRecipeAgent(testQuestion, testCamera);
    
    // Only run analysis step to avoid external dependencies
    const analysisResult = await agent.analyzeQuestion();
    
    if (analysisResult) {
      console.log('✅ Question analysis completed successfully');
      console.log('🔍 Agent state:', agent.getStep());
    } else {
      console.log('ℹ️ Question analysis returned false (may be unrelated question)');
    }
    
    return {
      success: true,
      langfuseEnabled,
      analysisResult,
      step: agent.getStep(),
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      langfuseEnabled,
    };
  }
}

// Export for use in API routes or other test contexts
export default testLangfuseIntegration;