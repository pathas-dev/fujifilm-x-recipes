import { Document } from '@langchain/core/documents';

type DocumentMetadata = {
  camera: string;
  colorOrBw: string;
  creator: string;
  id: number;
  name: string;
  rawSettings: string;
  sensor: string;
  settings_clarity: number;
  settings_color: number;
  settings_colourChrome: string;
  settings_colourChromeFXBlue: string;
  settings_dynamicRange: string;
  settings_exposure: number;
  settings_filmSimulation: string;
  settings_grainEffect: string;
  settings_grainSize: string;
  settings_highlight: number;
  settings_iso: number;
  settings_noiseReduction: number;
  settings_priority: string;
  settings_shadow: number;
  settings_sharpness: number;
  settings_shiftBlue: number;
  settings_shiftRed: number;
  settings_whiteBalance: string;
  text: string;
  url: string;
};

export const formatContext = (results: Document[]) => {
  return results.reduce((acc, current, index) => {
    const metadata = current.metadata as DocumentMetadata;

    const text = `
        ### **[검색된 레시피 정보 - ${index === 0 ? '가장 유사한 레시피 (Top-1)' : '추가 참고 레시피 (Top-N)'}]**
        <레시피 ${index + 1}> 
        ${current.pageContent},
        <URL ${index + 1}>
        ${metadata.url},
      `
      .split('\n\n')
      .map((line) => line.trim())
      .join('\n');

    return acc + '\n\n' + text;
  }, '');
};
