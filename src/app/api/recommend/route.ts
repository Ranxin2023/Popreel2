import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { createSimilarityMatrix, recommendVideos } from "@/lib/recommendation"; // Import helper functions

interface Video {
  title: string;
  description: string;
  genres: string;
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");

  if (!title) {
    return NextResponse.json({ error: "Video title is required" }, { status: 400 });
  }

  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

  try {
    await client.connect();
    const db = client.db("Popreel"); // Use the correct database name
    const collection = db.collection<Video>("videos");
    const videos = await collection.find({}).toArray();

    if (videos.length === 0) {
      return NextResponse.json({ error: "No videos found in the database." }, { status: 404 });
    }

    const videoData = videos.map((video) => ({
      title: video.title,
      description: video.description,
      tags: video.genres.replace(/\|/g, ", "), // Convert genres to a comma-separated string
    }));

    const similarityMatrix = createSimilarityMatrix(videoData);

    const videoIndex = videoData.findIndex((video) => video.title === title);
    if (videoIndex === -1) {
      return NextResponse.json({ error: `Video with title '${title}' not found.` }, { status: 404 });
    }

    const recommendations = recommendVideos(title, videoData, similarityMatrix);
    console.log("Recommendations are", recommendations)
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
