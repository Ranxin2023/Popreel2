'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const genresList = [
  'Action', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Romance', 'Sci-Fi', 'Thriller', 'Animation', 'Adventure'
];

export default function GenreSelection(): JSX.Element {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const router = useRouter();

  const handleGenreChange = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genres: selectedGenres }),
      });

      if (response.ok) {
        router.push('/tiktok_home'); // Redirect to homepage or dashboard
      } else {
        console.error('Failed to save genres');
      }
    } catch (error) {
      console.error('Error saving genres:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Select Your Favorite Genres</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {genresList.map((genre) => (
            <label key={genre} className="flex items-center space-x-3">
              <input
                type="checkbox"
                value={genre}
                checked={selectedGenres.includes(genre)}
                onChange={() => handleGenreChange(genre)}
                className="form-checkbox text-blue-500"
              />
              <span>{genre}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
}
