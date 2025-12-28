'use client';

import { useEffect, useState } from 'react';

type Strategy = {
  _id: string;
  content: string;
  likes: string[];
  comments: { text: string }[];
  createdAt: string;
};

type Media = {
  _id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  likes: string[];
  createdAt: string;
};

export default function MyPostsPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';

  /* ================= FETCH MY POSTS ================= */
  const fetchMyPosts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/my-posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await res.json();
      setStrategies(data.strategies || []);
      setMedia(data.media || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load your posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  /* ================= UI ================= */
  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-2xl font-semibold">My Posts</h1>

      {loading && (
        <p className="text-sm text-gray-400">Loading your posts…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading &&
        strategies.length === 0 &&
        media.length === 0 && (
          <p className="text-sm text-gray-400">
            You haven’t posted anything yet.
          </p>
        )}

      {/* ================= STRATEGIES ================= */}
      {strategies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Strategies</h2>

          {strategies.map((s) => (
            <div
              key={s._id}
              className="border border-zinc-800 rounded-lg p-4 space-y-2"
            >
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {s.content}
              </p>

              <div className="text-xs text-gray-500 flex gap-4">
                <span>❤️ {s.likes.length}</span>
                <span>💬 {s.comments.length}</span>
                <span>
                  {new Date(s.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= MEDIA ================= */}
      {media.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Media</h2>

          {media.map((m) => (
            <div
              key={m._id}
              className="border border-zinc-800 rounded-lg p-4 space-y-2"
            >
              {m.type === 'image' ? (
                <img
                  src={m.url}
                  alt="media"
                  className="rounded max-h-96"
                />
              ) : (
                <video
                  src={m.url}
                  controls
                  className="rounded max-h-96"
                />
              )}

              <div className="text-xs text-gray-500 flex gap-4">
                <span>❤️ {m.likes.length}</span>
                <span>
                  {new Date(m.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
