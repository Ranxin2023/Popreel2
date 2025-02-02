import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

// Database connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DATABASE_NAME = "Popreel";
const COLLECTION_NAME = "users";

/**
 * Handles POST requests for user login.
 * @param req Incoming request object.
 * @returns Response with success or error message.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Connect to the database
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // Find the user by email
    const user = await usersCollection.findOne({ email });

    if (!user) {
      await client.close();
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await client.close();
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await client.close();

    // Success response with user ID
    return NextResponse.json({ message: "Login successful", userId: user._id });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
