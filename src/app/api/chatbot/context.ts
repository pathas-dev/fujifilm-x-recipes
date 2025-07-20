import { Document } from "@langchain/core/documents";

export const formatContext = (results: Document[]) => {
  return results.reduce((acc, current, index) => {
    const text = `
        [본문 ${index + 1}] 
        ${current.pageContent},

        [세팅 ${index + 1}]
        ${current.metadata["settings"]},
        
        [URL ${index + 1}]
        ${current.metadata["url"]},
      `
      .split("\n\n")
      .map((line) => line.trim())
      .join("\n");

    return acc + "\n\n" + text;
  }, "");
};
