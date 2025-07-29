# Langfuse Integration for Fujifilm X Recipes

This implementation adds simple Langfuse monitoring to the AI curator's LLM calls following the official LangChain integration pattern.

## Features

- **Simple Integration**: Uses the standard `langfuse-langchain` CallbackHandler
- **Session Tracking**: Each AI agent workflow gets a unique session ID for tracing related calls
- **Conditional Activation**: Only enabled when environment variables are present
- **Zero Overhead**: No performance impact when disabled
- **Graceful Fallback**: System continues working even if Langfuse fails

## Implementation

### Files Modified

- `package.json`: Added `langfuse-langchain` dependency
- `src/app/api/chatbot/langfuse-callback.ts`: Simple callback handler creation utility
- `src/app/api/chatbot/llm.ts`: Enhanced LLM creation to support optional tracing
- `src/app/api/chatbot/agent.ts`: Added session ID and tracing to LLM calls

### Key Changes

1. **LLM Creation**: The `createLLM` function now accepts optional tracing parameters
2. **Session Management**: Each agent gets a unique session ID (`recipe-agent-{timestamp}-{random}`)
3. **Callback Integration**: LLM calls include Langfuse callbacks when configured

## Environment Setup

To enable monitoring, set these environment variables:

```bash
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_PUBLIC_KEY=pk-lf-...  
LANGFUSE_HOST_URL=https://cloud.langfuse.com
```

## Usage

When environment variables are configured, the system automatically:

1. Creates Langfuse callbacks for each LLM instance
2. Tracks two main operations:
   - Question analysis (using Gemini Flash Lite)
   - Recipe generation (using Gemini Flash)
3. Groups related traces under the same session ID

## Verification

Run the verification script to test the integration:

```bash
node verify-langfuse-simple.js
```

## Monitoring

In Langfuse dashboard, you'll see:

- **Sessions**: Each AI workflow grouped by session ID
- **Traces**: Individual LLM calls with input/output data
- **Performance**: Timing and usage metrics
- **Errors**: Any failures in the LLM pipeline

The implementation is minimal and follows the official LangChain integration guide for maximum reliability and simplicity.