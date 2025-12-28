'use client';

import { useEffect, useState } from 'react';

type TrendingItem = {
  type: 'strategy' | 'media';
  id: string;
  content?: string;
  mediaType?: 'image' | 'video';
  url?: string;
  caption?: string;
  author: string;
  score: number;
  createdAt: string;
};

export default function TrendingPage() {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';

  const fetchTrending = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/trending`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setItems(data);
    } catch {
      setError('Failed to load trending posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Trending</h1>

      {loading && (
        <p className="text-sm text-gray-400">Loading trending…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && items.length === 0 && (
        <p className="text-sm text-gray-400">
          No trending content yet.
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-zinc-800 rounded-lg p-4 space-y-2"
          >
            <div className="text-xs text-gray-500">
              🔥 {item.score} · {item.author}
            </div>

            {item.type === 'strategy' && (
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {item.content}
              </p>
            )}

            {item.type === 'media' && (
              <>
                {item.mediaType === 'image' ? (
                  <img
                    src={item.url}
                    className="rounded max-h-96"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="rounded max-h-96"
                  />
                )}
                {item.caption && (
                  <p className="text-sm text-gray-300">
                    {item.caption}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
