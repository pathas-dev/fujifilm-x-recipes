export const createStreamingResponse = async (
  chain: any,
  context: string,
  question: string
) => {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const streamingResponse = await chain.stream({ context, question });

        for await (const chunk of streamingResponse) {
          let content = '';
          if (typeof chunk.content === 'string') content = chunk.content;
          if (Array.isArray(chunk.content))
            content = chunk.content
              .map((item: any) => item.text || '')
              .join('');

          if (content) controller.enqueue(new TextEncoder().encode(content));
        }

        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      }
    },
  });

  return stream;
};
