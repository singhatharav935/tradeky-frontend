'use client';

import { useEffect, useState } from 'react';

type News = {
  _id: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  tags?: string[];
  publishedAt: string;
};

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';

  /* ================= FETCH NEWS ================= */
  const fetchNews = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/news`);

      if (!res.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await res.json();
      setNews(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load market news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  /* ================= UI ================= */
  return (
    <div className="max-w-4xl space-y-6">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold">Market News</h1>

      {/* STATES */}
      {loading && (
        <p className="text-sm text-gray-400">Loading news…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && news.length === 0 && !error && (
        <p className="text-sm text-gray-400">
          No news available right now.
        </p>
      )}

      {/* NEWS LIST */}
      <div className="space-y-4">
        {news.map(item => (
          <div
            key={item._id}
            className="border border-zinc-800 rounded-lg p-4 space-y-2"
          >
            <h2 className="text-lg font-medium">
              {item.title}
            </h2>

            <p className="text-sm text-gray-300">
              {item.summary}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {item.source} ·{' '}
                {new Date(item.publishedAt).toLocaleDateString()}
              </span>

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Read more
                </a>
              )}
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap pt-2">
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-zinc-800 px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
