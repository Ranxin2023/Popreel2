import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

// Database connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DATABASE_NAME = "Popreel";
const COLLECTION_NAME = "users";

/**
 * Handles POST requests to create a new user.
 * @param req Incoming request object.
 * @returns Response with success or error message.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { username, email, password } = await req.json();

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Connect to the database
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const usersCollection = db.collection(COLLECTION_NAME);

    // Check if the email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      await client.close();
      return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    }

    // Insert new user into the database
    const result = await usersCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    const userId = result.insertedId;

    await client.close();

    // Success response with userId
    return NextResponse.json({ message: "User created successfully.", userId });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
