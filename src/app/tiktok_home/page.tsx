'use client';

import { useState, useEffect } from 'react';

interface Video {
  title: string;
  description: string;
  tags: string;
}

export default function TikTokDashboard(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'forYou' | 'upload'>('forYou');
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recommend?title=American President, The (1995)`);
      const data: Video[] = await response.json();
      setRecommendations(data);
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/5 bg-white shadow-md flex flex-col items-center py-4">
        <h1 className="text-2xl font-bold mb-8">TikTok</h1>
        <button
          className={`w-full py-2 px-4 mb-2 text-left ${
            activeTab === 'forYou' ? 'bg-gray-200 font-bold' : ''
          } hover:bg-gray-100`}
          onClick={() => setActiveTab('forYou')}
        >
          For You
        </button>
        <button
          className={`w-full py-2 px-4 text-left ${
            activeTab === 'upload' ? 'bg-gray-200 font-bold' : ''
          } hover:bg-gray-100`}
          onClick={() => setActiveTab('upload')}
        >
          Upload
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {activeTab === 'forYou' && (
          <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">For You</h2>
            {loading ? (
              <p>Loading recommendations...</p>
            ) : (
              <ul>
                {recommendations.map((video, index) => (
                  <li key={index} className="mb-4">
                    <h3 className="font-bold">{video.title}</h3>
                    <p>{video.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Upload Video</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Video uploaded successfully!');
              }}
            >
              <div className="mb-4">
                <label htmlFor="video" className="block text-gray-600">Video</label>
                <input
                  id="video"
                  type="file"
                  accept="video/*"
                  className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="caption" className="block text-gray-600">Caption</label>
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
      </div>
    </div>
  );
}
