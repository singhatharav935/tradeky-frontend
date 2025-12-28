'use client';

import { useEffect, useState } from 'react';

type Trader = {
  userId: string;
  name: string;
  email: string;
  totalStrategies: number;
  totalLikes: number;
  totalSaves: number;
  score: number;
};

export default function TopTradersPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';

  const fetchTopTraders = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/top-traders`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setTraders(data);
    } catch {
      setError('Failed to load top traders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopTraders();
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Top Traders</h1>

      {loading && (
        <p className="text-sm text-gray-400">Loading leaderboard…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && traders.length === 0 && (
        <p className="text-sm text-gray-400">
          No traders ranked yet.
        </p>
      )}

      <div className="space-y-3">
        {traders.map((t, index) => (
          <div
            key={t.userId}
            className="border border-zinc-800 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">
                #{index + 1} {t.name || 'Trader'}
              </div>
              <div className="text-xs text-gray-500">
                Strategies: {t.totalStrategies} · Likes: {t.totalLikes} · Saves:{' '}
                {t.totalSaves}
              </div>
            </div>

            <div className="text-lg font-semibold">
              {t.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
