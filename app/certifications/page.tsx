'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CertificationsPage() {
  const router = useRouter();
  const [showPropMessage, setShowPropMessage] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Certifications & Badges</h1>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-white"
          >
            Back
          </button>
        </div>

        {/* INFO */}
        <div className="border border-zinc-700 bg-zinc-900 rounded-lg p-5">
          <p className="text-sm text-gray-400 mb-4">
            You haven’t earned any skill certificates or badges yet.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setShowPropMessage(true)}
              className="px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
            >
              Prop Funding Company Requirements
            </button>

            <button
              className="px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
            >
              Upload Resume
            </button>

            <button
              className="px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
            >
              Upload Certifications
            </button>
          </div>

          {showPropMessage && (
            <div className="border border-zinc-700 bg-black rounded p-3 text-sm text-gray-300">
              No requirements are open at the moment.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
