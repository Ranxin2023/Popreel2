import { TfIdf } from "natural";
import KNN from "@/lib/knn"; // Custom KNN class
import { cosineSimilarity } from "@/lib/utils"; // Import cosine similarity function

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
 * Recommend videos based on genres, cosine similarity, and KNN.
 * @param favoriteGenres User's favorite genres.
 * @param videos Array of videos to consider.
 * @returns An array of recommended videos.
 */
export function recommendVideos(
  favoriteGenres: string[],
  videos: Video[]
): Video[] {
  // Filter videos matching user's favorite genres
  const genreMatchedVideos = videos.filter((video) => {
    const videoGenres = Array.isArray(video.genres) ? video.genres : []; // Ensure genres is an array
    return videoGenres.some((genre) => favoriteGenres.includes(genre));
  });

  if (genreMatchedVideos.length === 0) {
    return [];
  }

  // Convert videos to feature vectors
  const featureVectors = genreMatchedVideos.map((video) =>
    createFeatureVector(video)
  );

  // Convert user's favorite genres to a test vector
  const testVector = createFeatureVectorFromGenres(favoriteGenres);

  // Calculate cosine similarity for each video relative to the user's preferences
  const similarityScores: RecommendationScore[] = featureVectors.map(
    (vector, index) => ({
      index,
      score: cosineSimilarity(vector, testVector),
    })
  );

  // Sort videos by similarity scores in descending order
  similarityScores.sort((a, b) => b.score - a.score);

  // Extract the top N videos based on similarity scores
  const topVideos = similarityScores
    // .slice(0, 150) // Limit to top 15
    .map(({ index }) => genreMatchedVideos[index]);

  // Use KNN for refining recommendations
  const knn = new KNN(5, cosineSimilarity); // Use cosine similarity as the distance metric
  knn.fit(featureVectors, genreMatchedVideos.map((_, index) => index));

  const refinedRecommendations = topVideos.map((video) => {
    const videoVector = createFeatureVector(video);
    return knn.predict(videoVector); // Refine using KNN
  });

  // Map the refined recommendations back to video objects
  const deduplicatedRecommendations = Array.from(
    new Map(
      refinedRecommendations.map((index) => [
        genreMatchedVideos[index].title, // Use the title as a unique identifier
        genreMatchedVideos[index],
      ])
    ).values()
  );

  return deduplicatedRecommendations;
}


/**
 * Converts a video object into a feature vector.
 * @param video Video object.
 * @returns Feature vector representing the video.
 */
function createFeatureVector(video: Video): number[] {
  const combinedFeatures = `${video.title} ${video.description} ${video.genres.join(
    " "
  )}`;
  const tfidf = new TfIdf();
  tfidf.addDocument(combinedFeatures);

  return tfidf.listTerms(0).map((term) => term.tfidf); // Convert TF-IDF scores to feature vector
}

/**
 * Creates a feature vector from user's favorite genres.
 * @param genres Array of favorite genres.
 * @returns Feature vector representing the user's preferences.
 */
function createFeatureVectorFromGenres(genres: string[]): number[] {
  const combinedGenres = genres.join(" ");
  const tfidf = new TfIdf();
  tfidf.addDocument(combinedGenres);

  return tfidf.listTerms(0).map((term) => term.tfidf); // Convert TF-IDF scores to feature vector
}
