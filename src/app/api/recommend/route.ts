import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { recommendVideos } from "@/lib/recommendation";

interface Video {
  title: string;
  description: string;
  genres: string[] | string; // Handle both array and string types
}

interface User {
  _id: ObjectId;
  favoriteGenres: string[];
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

  try {
    await client.connect();
    const db = client.db("Popreel");
    const usersCollection = db.collection<User>("users");
    const videosCollection = db.collection<Video>("videos");

    // Fetch user details
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user || !user.favoriteGenres || user.favoriteGenres.length === 0) {
      return NextResponse.json({ error: "No favorite genres specified." }, { status: 404 });
    }

    const favoriteGenres = user.favoriteGenres;
    console.log(`favorite genres are:${favoriteGenres}`)
    // Fetch videos matching user's favorite genres
    const videos = await videosCollection.find({ genres: { $in: favoriteGenres } }).toArray();

    if (videos.length === 0) {
      return NextResponse.json({
        error: "No videos found matching the user's favorite genres.",
      }, { status: 404 });
    }

    // Normalize genres to arrays and log for debugging
    const normalizedVideos = videos.map((video) => ({
      ...video,
      genres: Array.isArray(video.genres)
        ? video.genres
        : video.genres.split(",").map((genre) => genre.trim()), // Convert string to array if needed
    }));

    // console.log("Normalized Videos:", normalizedVideos);

    // Generate recommendations
    const recommendations = recommendVideos(favoriteGenres, normalizedVideos);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await client.close();
  }
}
