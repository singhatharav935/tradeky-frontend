'use client';

import { useState } from 'react';

type MediaItem = {
  type: 'image' | 'video';
  url: string;
};

type Props = {
  onPostCreated?: () => void;
};

export default function CreatePost({ onPostCreated }: Props) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= FILE SELECT ================= */
  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setMedia(Array.from(e.target.files));
  };

  /* ================= UPLOAD SINGLE FILE ================= */
  const uploadFile = async (file: File): Promise<MediaItem> => {
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(
      'https://tradeky-backend.onrender.com/api/upload',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!res.ok) throw new Error('Upload failed');

    const data = await res.json();

    return {
      type: file.type.startsWith('video') ? 'video' : 'image',
      url: data.url,
    };
  };

  /* ================= SUBMIT POST ================= */
  const submit = async () => {
    if (!content.trim() && media.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Login required');
      return;
    }

    try {
      setLoading(true);

      // 🔼 upload media first
      const uploadedMedia: MediaItem[] = [];
      for (const file of media) {
        const m = await uploadFile(file);
        uploadedMedia.push(m);
      }

      // 🧠 create strategy
      const res = await fetch(
        'https://tradeky-backend.onrender.com/api/community',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            media: uploadedMedia,
          }),
        }
      );

      if (!res.ok) throw new Error('Post failed');

      setContent('');
      setMedia([]);
      onPostCreated?.();
    } catch (err) {
      console.error(err);
      alert('Failed to post strategy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 p-4 rounded border border-zinc-800 space-y-3">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Share your trading strategy..."
        className="w-full bg-black border border-zinc-700 rounded p-3 text-sm min-h-[100px]"
      />

      {/* 📸 MEDIA PICKER */}
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={onSelectFiles}
        className="text-xs text-gray-400"
      />

      {/* PREVIEW */}
      {media.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {media.map((file, i) => (
            <div
              key={i}
              className="text-xs bg-black px-2 py-1 rounded border border-zinc-700"
            >
              {file.name}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="bg-yellow-500 text-black px-4 py-1 rounded text-sm disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post Strategy'}
      </button>
    </div>
  );
}
