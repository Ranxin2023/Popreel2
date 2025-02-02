import { TfIdf } from "natural";
interface Video {
  title: string;
  description: string;
  genres: string[];
}

interface RecommendationScore {
  index: number;
  score: number;
}
/**
 * Compute cosine similarity between two vectors.
 * @param vecA First vector.
 * @param vecB Second vector.
 * @returns Cosine similarity score.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Create a similarity matrix based on video data.
 * @param data Array of video objects.
 * @returns A similarity matrix.
 */
export function createSimilarityMatrix(data: Video[]): number[][] {
  const combinedFeatures = data.map(
    (video) => `${video.description}, ${video.genres.join(", ")}`
  );

  const tfidf = new TfIdf();
  combinedFeatures.forEach((doc) => tfidf.addDocument(doc));

  const vectors: number[][] = combinedFeatures.map((_, docIndex) =>
    tfidf.listTerms(docIndex).map((term) => term.tfidf)
  );

  return vectors.map((vecA) =>
    vectors.map((vecB) => cosineSimilarity(vecA, vecB))
  );
}