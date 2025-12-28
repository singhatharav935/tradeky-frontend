'use client';

import { useEffect, useState } from 'react';

type Media = {
  _id: string;
  type: 'image' | 'video';
  url: string;
  caption: string;
  likes: string[];
  author: {
    name?: string;
    email?: string;
  };
  createdAt: string;
};

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  /* ================= FETCH MEDIA ================= */
  const fetchMedia = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media`
      );
      const data = await res.json();
      setMedia(data);
    } catch (err) {
      console.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  /* ================= CREATE MEDIA ================= */
  const postMedia = async () => {
    if (!url.trim()) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type,
            url,
            caption,
          }),
        }
      );

      if (res.ok) {
        setUrl('');
        setCaption('');
        fetchMedia();
      }
    } catch {
      alert('Failed to post media');
    }
  };

  /* ================= LIKE / UNLIKE ================= */
  const toggleLike = async (id: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/media/${id}/like`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchMedia();
    } catch {
      alert('Failed to like media');
    }
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold">Media</h1>

      {/* CREATE MEDIA */}
      <div className="border border-zinc-800 rounded-lg p-4 space-y-3">
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="bg-black border border-zinc-700 rounded px-2 py-1 text-sm"
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Media URL"
            className="flex-1 bg-black border border-zinc-700 rounded px-3 py-1 text-sm"
          />
        </div>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm"
        />

        <button
          onClick={postMedia}
          className="bg-white text-black px-4 py-1 rounded text-sm font-medium"
        >
          Post
        </button>
      </div>

      {/* MEDIA FEED */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading media...</p>
      ) : media.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No media shared yet.
        </p>
      ) : (
        <div className="space-y-6">
          {media.map((item) => (
            <div
              key={item._id}
              className="border border-zinc-800 rounded-lg p-4 space-y-3"
            >
              {/* AUTHOR */}
              <div className="text-xs text-gray-400">
                Posted by {item.author?.name || 'User'}
              </div>

              {/* MEDIA */}
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt="media"
                  className="rounded max-h-96"
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  className="rounded max-h-96"
                />
              )}

              {/* CAPTION */}
              {item.caption && (
                <p className="text-sm">{item.caption}</p>
              )}

              {/* ACTIONS */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <button
                  onClick={() => toggleLike(item._id)}
                  className="hover:text-white"
                >
                  ❤️ {item.likes.length}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
