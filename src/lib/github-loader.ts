import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { type Document } from "@langchain/core/documents";
// import { aiSummarizeCode, generateEmbedding } from "./gemini";
import { db } from "@/server/db";

// export const loadGithubRepo = async (
//   githubUrl: string,
//   githubToken?: string,
// ) => {
//   const loader = new GithubRepoLoader(githubUrl, {
//     accessToken: githubToken || "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",
//     branch: "main",
//     ignoreFiles: [
//       "bun.lockb",
//       "package-lock.json",
//       "yarn.lock",
//       "pnpm-lock.yaml",
//     ],
//     recursive: true,
//     unknown: "warn",
//     maxConcurrency: 5,
//   });

//   const docs = await loader.load();
//   return docs;
// };

// export const indexGithubRepo = async (
//   projectId: string,
//   githubUrl: string,
//   githubToken?: string,
// ) => {
//   const docs = await loadGithubRepo(githubUrl, githubToken);

//   const allEmbeddings = await generateEmbeddings(docs);

//   await Promise.allSettled(
//     allEmbeddings.map(async (embedding, index) => {
//       console.log("processing", index, "of embeddings", allEmbeddings.length);
//       if (!embedding) return;

//       const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
//         data: {
//           sourceCode: embedding.sourceCode,
//           summary: embedding.summary,
//           fileName: embedding.fileName,
//           projectId,
//         },
//       });

//       await db.$executeRaw`
//       UPDATE "SourceCodeEmbedding"
//       SET "summaryEmbedding" = ${embedding.embedding}::vector
//       WHERE "id" = ${sourceCodeEmbedding.id}
//       `;
//     }),
//   );
// };

// const generateEmbeddings = async (docs: Document[]) => {
//   return await Promise.all(
//     docs.map(async (doc) => {
//       const summary = await aiSummarizeCode(doc);
//       const embedding = await generateEmbedding(summary);
//       return {
//         summary,
//         embedding,
//         sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
//         fileName: doc.metadata.source,
//       };
//     }),
//   );
// };
