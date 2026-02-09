import { AgentStep, FujifilmRecipeAgent } from '@/app/api/chatbot/agent';
import { NextResponse } from 'next/server';
import { CameraModel } from './shema';

export const dynamic = 'force-dynamic';

// 서버 센트 이벤트 스트리밍 엔드포인트
export async function POST(request: Request) {
  try {
    const { question, cameraModel } = (await request.json()) as {
      question: string;
      cameraModel: CameraModel;
    };

    // 스트리밍 응답 설정
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        // SSE 이벤트 전송 함수
        const sendEvent = (event: 'state' | AgentStep, data: any) => {
          const eventData = `event: ${event}\ndata: ${JSON.stringify(
            data
          )}\n\n`;
          controller.enqueue(encoder.encode(eventData));
        };

        // Agent 생성 및 실행
        const executeAgent = async () => {
          try {
            const agent = new FujifilmRecipeAgent(question, cameraModel);

            // 각 단계별로 상태 전송
            sendEvent('state', agent.getState());

            // 단계별 실행
            const shouldContinue = await agent.analyzeQuestion();
            sendEvent('state', agent.getState());

            if (!shouldContinue) {
              const state = agent.getState();
              if (state.step === 'error') {
                // 에러 상태면 에러 이벤트 전송
                sendEvent('error', { error: state.error });
              } else {
                // 정상 종료 (관련 없는 질문 등)
                sendEvent('completed', state.response);
              }
              controller.close();
              return;
            }

            if (!(await agent.searchDocuments())) {
              sendEvent('error', { error: agent.getState().error });
              controller.close();
              return;
            }
            sendEvent('state', agent.getState());

            if (!(await agent.generateRecipes())) {
              sendEvent('error', { error: agent.getState().error });
              controller.close();
              return;
            }
            sendEvent('state', agent.getState());

            await agent.processImages();
            sendEvent('state', agent.getState());

            await agent.finalizeResponse();

            // 최종 결과 전송
            sendEvent('completed', agent.getState().response);
            controller.close();
          } catch (error) {
            console.error('Agent execution error:', error);
            sendEvent('error', { error: 'Failed to process agent request' });
            controller.close();
          }
        };

        executeAgent();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('SSE POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize streaming request' },
      { status: 500 }
    );
  }
}
