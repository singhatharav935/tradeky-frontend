'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

type AuthContextType = {
  token: string | null;
  socket: Socket | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  /* ================= LOAD TOKEN ================= */
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  /* ================= SOCKET INIT ================= */
  useEffect(() => {
    if (!token) {
      // 🔌 disconnect socket on logout
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // 🔌 connect socket when token exists
    const newSocket = io('https://tradeky-backend.onrender.com', {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  /* ================= AUTH ACTIONS ================= */
  const login = (jwt: string) => {
    localStorage.setItem('token', jwt);
    setToken(jwt);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, socket, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
