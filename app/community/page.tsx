'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import CreatePost from '@/components/CreatePost';
import CommunityFeed from '@/components/CommunityFeed';
import { authFetch } from '@/lib/authFetch';

export default function CommunityPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    authFetch('/api/protected')
      .then((data: any) => {
        if (data?.__unauthorized) {
          localStorage.removeItem('token');
          router.replace('/login');
          return;
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">Loading community...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">

        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Community Feed</h1>

          <button
            onClick={() => router.push('/dashboard')}
            className="px-3 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
          >
            Back to Dashboard
          </button>
        </div>

        {/* ===== CREATE POST ===== */}
        <CreatePost onPostCreated={() => setRefreshKey(k => k + 1)} />

        {/* ===== FEED ===== */}
        <div className="mt-6">
          <CommunityFeed refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
