'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Video {
  title: string;
  description: string;
  genres: string[];
  videoUrl: string; // Dynamically generated video URL
}

export default function TikTokDashboard(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'forYou' | 'upload'>('forYou');
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recommend?userId=${userId}`);
      const data: Omit<Video, 'videoUrl'>[] = await response.json();

      // Dynamically generate video URLs based on the title
      const recommendationsWithUrls = data.map((video) => ({
        ...video,
        videoUrl: `https://fakevideostreaming.com/watch/${encodeURIComponent(
          video.title.replace(/\s+/g, '-').toLowerCase()
        )}`,
      }));

      setRecommendations(recommendationsWithUrls);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'forYou') {
      fetchRecommendations();
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold">TikTok</h1>
        <div>
          <button
            className={`px-4 py-2 rounded-lg mr-2 ${
              activeTab === 'forYou' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('forYou')}
          >
            For You
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'upload' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setActiveTab('upload')}
          >
            Upload
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'forYou' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-center col-span-full">Loading recommendations...</p>
            ) : (
              recommendations.map((video, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col justify-between"
                >
                  <h3 className="font-bold text-lg">{video.title}</h3>
                  <p className="text-sm text-gray-600">{video.description}</p>
                  <p className="text-sm text-gray-500">
                    Genres: {video.genres.join(', ')}
                  </p>
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mt-4 block"
                  >
                    Watch Video
                  </a>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Upload Video</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Video uploaded successfully!');
              }}
            >
              <div className="mb-4">
                <label htmlFor="video" className="block text-gray-600">
                  Video
                </label>
                <input
                  id="video"
                  type="file"
                  accept="video/*"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="caption" className="block text-gray-600">
                  Caption
                </label>
                <textarea
                  id="caption"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="Write a caption..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Upload
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
