'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

type User = { _id: string; name: string };

type Group = {
  _id: string;
  name: string;
  description: string;
  members: User[];
  owner: User;
  isLocked: boolean;
};

type Message = {
  _id: string;
  text: string;
  createdAt: string;
  sender: User;
};

type GroupPost = {
  _id: string;
  content: string;
  media: { type: 'image' | 'video'; url: string }[];
  author: User;
  createdAt: string;
};

let socket: Socket | null = null;

export default function GroupPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [text, setText] = useState('');
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!groupId) return;

    socket = io('https://tradeky-backend.onrender.com');
    socket.emit('join-group', groupId);

    socket.on('new-message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket?.off('new-message');
      socket?.disconnect();
      socket = null;
    };
  }, [groupId]);

  /* ================= LOAD GROUP ================= */
  const loadGroup = async () => {
    const res = await fetch(
      `https://tradeky-backend.onrender.com/api/groups/${groupId}`
    );
    const data = await res.json();
    setGroup(data);
  };

  /* ================= LOAD POSTS ================= */
  const loadPosts = async () => {
    const res = await fetch(
      `https://tradeky-backend.onrender.com/api/group-posts/${groupId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    const data = await res.json();
    setPosts(data);
  };

  /* ================= LOAD CHAT ================= */
  const loadMessages = async () => {
    const res = await fetch(
      `https://tradeky-backend.onrender.com/api/chat/group/${groupId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    const data = await res.json();
    setMessages(data);
  };

  /* ================= INIT LOAD ================= */
  useEffect(() => {
    if (!groupId) return;
    loadGroup();
    loadPosts();
    loadMessages();
  }, [groupId]);

  /* ================= CURRENT USER ================= */
  useEffect(() => {
    if (!token) return;

    fetch('https://tradeky-backend.onrender.com/api/protected', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setMyUserId(d.user.id));
  }, [token]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ================= SEND CHAT ================= */
  const sendMessage = async () => {
    if (!token || !text.trim()) return;

    await fetch(
      `https://tradeky-backend.onrender.com/api/chat/group/${groupId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      }
    );

    setText('');
  };

  if (!group) {
    return <p className="text-gray-400">Loading…</p>;
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4 h-[calc(100vh-120px)]">

      {/* ================= LEFT ================= */}
      <div className="col-span-2 flex flex-col gap-4">

        {/* GROUP HEADER */}
        <div className="bg-zinc-900 p-4 rounded border border-zinc-800">
          <h1 className="text-xl font-semibold">{group.name}</h1>
          <p className="text-sm text-gray-400">{group.description}</p>
        </div>

        {/* ================= GROUP POSTS ================= */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-xs text-gray-500">
              No posts in this group yet.
            </p>
          ) : (
            posts.map(p => (
              <div
                key={p._id}
                className="bg-zinc-900 border border-zinc-800 rounded p-3"
              >
                <p className="text-xs text-yellow-400">
                  {p.author?.name || 'Member'}
                </p>

                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {p.content}
                </p>

                {p.media?.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {p.media.map((m, i) =>
                      m.type === 'image' ? (
                        <img
                          key={i}
                          src={m.url}
                          className="rounded border border-zinc-700"
                        />
                      ) : (
                        <video
                          key={i}
                          src={m.url}
                          controls
                          className="rounded border border-zinc-700"
                        />
                      )
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* ================= CHAT ================= */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-2">
            {messages.map(m => {
              const isMe = m.sender._id === myUserId;

              return (
                <div
                  key={m._id}
                  className={`flex ${
                    isMe ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded text-sm ${
                      isMe
                        ? 'bg-yellow-500 text-black'
                        : 'bg-zinc-800 text-white'
                    }`}
                  >
                    {!isMe && (
                      <p className="text-[10px] text-yellow-400">
                        {m.sender.name}
                      </p>
                    )}
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {!group.isLocked && (
            <div className="mt-2 flex gap-2">
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                className="flex-1 bg-black border border-zinc-700 rounded px-3 py-2"
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-yellow-500 text-black px-4 rounded"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3 overflow-y-auto">
        <h2 className="text-sm font-semibold mb-2">
          Members ({group.members.length})
        </h2>

        <div className="space-y-1">
          {group.members.map(m => (
            <div
              key={m._id}
              className="text-xs bg-black/40 px-2 py-1 rounded"
            >
              {m.name}
              {m._id === group.owner._id && (
                <span className="text-yellow-400 ml-1">(Owner)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
