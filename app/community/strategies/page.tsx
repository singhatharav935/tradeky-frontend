'use client';

import { useEffect, useState } from 'react';

type Strategy = {
  _id: string;
  title: string;
  description: string;
  author?: {
    name?: string;
    email?: string;
  };
  createdAt: string;
};

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';

  /* ================= FETCH STRATEGIES ================= */
  const fetchStrategies = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/strategies`);

      if (!res.ok) {
        throw new Error('Fetch failed');
      }

      const data = await res.json();
      setStrategies(data);
    } catch (err) {
      setError('Strategies backend not connected yet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  /* ================= CREATE STRATEGY ================= */
  const createStrategy = async () => {
    if (!title.trim() || !description.trim()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/strategies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!res.ok) {
        throw new Error('Create failed');
      }

      setTitle('');
      setDescription('');
      fetchStrategies();
    } catch {
      alert('Failed to create strategy');
    }
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-4xl space-y-6">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold">Strategies</h1>

      {/* CREATE STRATEGY */}
      <div className="border border-zinc-800 rounded-lg p-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Strategy title"
          className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your strategy (logic, entry, exit, risk)"
          className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-sm min-h-[120px]"
        />

        <button
          onClick={createStrategy}
          className="bg-white text-black px-4 py-1 rounded text-sm font-medium"
        >
          Publish Strategy
        </button>
      </div>

      {/* STATES */}
      {loading && (
        <p className="text-sm text-gray-400">Loading strategies…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && strategies.length === 0 && !error && (
        <p className="text-sm text-gray-400">
          No strategies published yet.
        </p>
      )}

      {/* STRATEGY LIST */}
      <div className="space-y-4">
        {strategies.map((s) => (
          <div
            key={s._id}
            className="border border-zinc-800 rounded-lg p-4 space-y-2"
          >
            <h2 className="text-lg font-medium">{s.title}</h2>

            <p className="text-sm text-gray-300">
              {s.description}
            </p>

            <div className="text-xs text-gray-500">
              By {s.author?.name || 'User'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
