'use client';

import { useRouter } from 'next/navigation';

export default function CertificationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-10">

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

        {/* ACTION BUTTONS - TOP LEFT */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/certifications/prop-funding')}
            className="px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
          >
            Prop Funding Company Requirements
          </button>

          <button
            onClick={() => router.push('/certifications/upload-resume')}
            className="px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
          >
            Upload Resume
          </button>

          <button
            onClick={() => router.push('/certifications/upload-certifications')}
            className="px-4 py-2 bg-zinc-800 rounded text-sm hover:bg-zinc-700"
          >
            Upload Certifications
          </button>
        </div>

        {/* CENTER MESSAGE */}
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-xl font-semibold text-gray-300 text-center">
            You haven’t earned any skill certificates or badges yet.
          </p>
        </div>

      </div>
    </div>
  );
}
