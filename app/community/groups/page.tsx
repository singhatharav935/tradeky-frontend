'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Group = {
  _id: string;
  name: string;
  description?: string;
  members?: string[];
  isPrivate?: boolean;
  owner?: { _id: string; name: string };
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  /* ================= CURRENT USER ================= */
  useEffect(() => {
    if (!token) return;
    fetch('https://tradeky-backend.onrender.com/api/protected', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setMyUserId(data?.user?.id));
  }, [token]);

  /* ================= LOAD GROUPS ================= */
  const loadGroups = () => {
    setLoading(true);
    fetch('https://tradeky-backend.onrender.com/api/groups')
      .then(res => res.json())
      .then(setGroups)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGroups();
  }, []);

  /* ================= CREATE GROUP ================= */
  const createGroup = async () => {
    if (!name.trim()) return alert('Group name required');

    await fetch('https://tradeky-backend.onrender.com/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, isPrivate }),
    });

    setName('');
    setDescription('');
    setIsPrivate(false);
    setShowCreate(false);
    loadGroups();
  };

  /* ================= JOIN / LEAVE ================= */
  const toggleJoin = async (groupId: string) => {
    await fetch(
      `https://tradeky-backend.onrender.com/api/groups/${groupId}/join`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    loadGroups();
  };

  if (loading) return <p className="text-gray-400">Loading groups…</p>;

  const myGroups = groups.filter(
    g =>
      g.owner?._id === myUserId ||
      g.members?.includes(myUserId || '')
  );

  const discoverGroups = groups.filter(
    g =>
      g.owner?._id !== myUserId &&
      !g.members?.includes(myUserId || '')
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Groups</h1>

        <button
          onClick={() => setShowCreate(v => !v)}
          className="px-3 py-1 bg-yellow-500 text-black rounded text-sm"
        >
          + Create Group
        </button>
      </div>

      {/* CREATE GROUP */}
      {showCreate && (
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded space-y-2">
          <input
            placeholder="Group name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded px-2 py-1 text-sm"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded px-2 py-1 text-sm"
          />

          <label className="text-xs flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={e => setIsPrivate(e.target.checked)}
            />
            Private group
          </label>

          <button
            onClick={createGroup}
            className="bg-green-600 px-3 py-1 rounded text-sm"
          >
            Create
          </button>
        </div>
      )}

      {/* MY GROUPS */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-300">My Groups</h2>

        {myGroups.length === 0 ? (
          <p className="text-xs text-gray-500">
            You haven’t joined or created any groups yet.
          </p>
        ) : (
          myGroups.map(group => (
            <GroupCard
              key={group._id}
              group={group}
              myUserId={myUserId}
              toggleJoin={toggleJoin}
            />
          ))
        )}
      </section>

      {/* DISCOVER */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-300">
          Discover Groups
        </h2>

        {discoverGroups.length === 0 ? (
          <p className="text-xs text-gray-500">
            No new groups to discover.
          </p>
        ) : (
          discoverGroups.map(group => (
            <GroupCard
              key={group._id}
              group={group}
              myUserId={myUserId}
              toggleJoin={toggleJoin}
            />
          ))
        )}
      </section>
    </div>
  );
}

/* ================= CARD ================= */
function GroupCard({
  group,
  myUserId,
  toggleJoin,
}: {
  group: Group;
  myUserId: string | null;
  toggleJoin: (id: string) => void;
}) {
  const isOwner = group.owner?._id === myUserId;
  const isMember = group.members?.includes(myUserId || '');

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2">
      <div className="flex justify-between items-center">
        <Link
          href={`/community/groups/${group._id}`}
          className="font-medium hover:underline"
        >
          {group.name}
        </Link>

        {!isOwner && (
          <button
            onClick={() => toggleJoin(group._id)}
            className={`px-2 py-0.5 rounded text-xs ${
              isMember
                ? 'bg-zinc-700'
                : 'bg-green-600 text-white'
            }`}
          >
            {isMember ? 'Leave' : 'Join'}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {group.description || 'No description'}
      </p>

      <p className="text-xs text-gray-500">
        Members: {group.members?.length ?? 0}
      </p>
    </div>
  );
}
