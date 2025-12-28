'use client';

import { useEffect, useState } from 'react';

type Member = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  strategies: number;
  media: number;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000';

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/members`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      setMembers(data);
    } catch {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Members</h1>

      {loading && (
        <p className="text-sm text-gray-400">Loading members…</p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && members.length === 0 && (
        <p className="text-sm text-gray-400">
          No members found.
        </p>
      )}

      <div className="space-y-3">
        {members.map(m => (
          <div
            key={m.id}
            className="border border-zinc-800 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-gray-500">
                Joined {new Date(m.joinedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="text-xs text-gray-400 text-right">
              <div>Strategies: {m.strategies}</div>
              <div>Media: {m.media}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
