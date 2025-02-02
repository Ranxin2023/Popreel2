import { NextResponse } from 'next/server';
import { MongoClient, ObjectId  } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, genres } = body;
    console.log(`User id:${userId} genres:${genres}`)
    if (!userId || !genres || genres.length === 0) {
      return NextResponse.json({ error: 'User ID and genres are required' }, { status: 400 });
    }

    await client.connect();
    const db = client.db('Popreel');
    const collection = db.collection('users');

    // Update user's genres
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) }, // Ensure you pass the user's ID during signup or login
      { $set: { favoriteGenres: genres } }
    );

    if (result.modifiedCount === 0) {
        console.log("fail to modify genres")
      return NextResponse.json({ error: 'Failed to update genres' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Genres updated successfully' });
  } catch (error) {
    console.error('Error updating genres:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await client.close();
  }
}
