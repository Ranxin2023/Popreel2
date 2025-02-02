import { TfIdf } from 'natural';

interface Video {
  title: string;
  description: string;
  tags: string;
}

/**
 * Computes cosine similarity between two vectors.
 * @param vecA First vector.
 * @param vecB Second vector.
 * @returns Cosine similarity score.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Creates a similarity matrix from the video data.
 * @param data Array of video objects.
 * @returns A similarity matrix.
 */
export function createSimilarityMatrix(data: Video[]): number[][] {
  const combinedFeatures = data.map(
    (video) => `${video.description}, ${video.tags}`
  );

  const tfidf = new TfIdf();
  combinedFeatures.forEach((doc) => tfidf.addDocument(doc));

  // Convert TF-IDF scores into vectors
  const vectors: number[][] = combinedFeatures.map((_, docIndex) =>
    tfidf.listTerms(docIndex).map((term) => term.tfidf)
  );

  // Calculate similarity matrix
  const similarityMatrix: number[][] = vectors.map((vecA) =>
    vectors.map((vecB) => cosineSimilarity(vecA, vecB))
  );

  return similarityMatrix;
}

/**
 * Recommends videos similar to the given title.
 * @param title Title of the video to find recommendations for.
 * @param data Array of video objects.
 * @param similarityMatrix Precomputed similarity matrix.
 * @returns An array of recommended videos.
 */
export function recommendVideos(
  title: string,
  data: Video[],
  similarityMatrix: number[][]
): Video[] {
  const videoIndex = data.findIndex((video) => video.title === title);
  if (videoIndex === -1) {
    throw new Error(`Video with title '${title}' not found.`);
  }

  const similarityScores = similarityMatrix[videoIndex]
    .map((score, index) => ({ index, score }))
    .sort((a, b) => b.score - a.score)
    .slice(1, 6); // Get top 5 recommendations

  return similarityScores.map(({ index }) => data[index]);
}
