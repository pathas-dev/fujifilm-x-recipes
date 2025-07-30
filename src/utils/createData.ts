import { Pinecone as PineconeClient } from '@pinecone-database/pinecone';
import { writeFileSync } from 'fs';
import path from 'path';

export const exportPineconeData = async () => {
  try {
    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

    // 1100개의 데이터를 100개씩 나누어서 가져오기
    const BATCH_SIZE = 100;
    const TOTAL_TARGET = 1100;
    const allVectors = [];
    let paginationToken = undefined;
    let totalFetched = 0;

    console.log(`총 ${TOTAL_TARGET}개의 레시피 데이터를 조회 시작...`);

    // 페이지네이션을 사용해서 모든 데이터를 가져옴
    while (totalFetched < TOTAL_TARGET) {
      const listResponse = await pineconeIndex.listPaginated({
        limit: BATCH_SIZE,
        paginationToken,
      });

      if (!listResponse.vectors || listResponse.vectors.length === 0) {
        console.log('더 이상 가져올 데이터가 없습니다.');
        break;
      }

      // 벡터 ID들을 사용하여 실제 데이터를 fetch
      const vectorIds = listResponse.vectors.map((v) => v.id!);
      const fetchResponse = await pineconeIndex.fetch(vectorIds);

      if (fetchResponse.records) {
        const vectors = Object.values(fetchResponse.records);
        allVectors.push(...vectors);
        totalFetched += vectors.length;
      }

      console.log(`${totalFetched}개 벡터 조회 완료`);

      // 다음 페이지 토큰 설정
      paginationToken = listResponse.pagination?.next;

      // 더 이상 페이지가 없거나 목표 개수에 도달하면 중단
      if (!paginationToken || totalFetched >= TOTAL_TARGET) {
        break;
      }
    }

    console.log(`총 ${allVectors.length}개의 레시피 데이터를 조회했습니다.`);

    // 데이터를 JSON 형태로 변환
    const exportData = allVectors.map((vector) => ({
      id: vector.id,
      pageContent: vector.metadata?.text || '',
    }));

    // JSON 파일로 저장
    const outputPath = path.resolve('public', 'exported-recipes.json');
    writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

    console.log(`데이터가 ${outputPath}에 저장되었습니다.`);
    return {
      success: true,
      count: allVectors.length,
      filePath: outputPath,
    };
  } catch (error) {
    console.error('Pinecone 데이터 조회 중 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

// 직접 실행할 때만 처리 (스크립트로 실행)
if (require.main === module) {
  exportPineconeData().then((result) => {
    console.log('조회 결과:', result);
    process.exit(result.success ? 0 : 1);
  });
}
