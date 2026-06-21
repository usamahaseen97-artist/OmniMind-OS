"use client";

import { useCallback, useEffect, useState } from "react";
import { getChats } from "../../lib/api";

interface NeuralHistoryPanelProps {
  userId: string;
  onOpenChat: (chatId: string) => void;
}

export function NeuralHistoryPanel({ userId, onOpenChat }: NeuralHistoryPanelProps) {
  const [chats, setChats] = useState<{ id: string; title: string }[]>([]);

  const load = useCallback(async () => {
    try {
      const data = await getChats({ id: userId });
      setChats(data.chats.map((c) => ({ id: c.id, title: c.title })));
    } catch {
      setChats([]);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-4">
      <h2 className="text-lg font-bold text-white">Neural History</h2>
      <p className="text-xs text-zinc-500">MongoDB-backed conversation memory</p>
      <ul className="mt-4 space-y-1">
        {chats.length === 0 && (
          <li className="py-8 text-center text-sm text-zinc-600">No saved sessions yet</li>
        )}
        {chats.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onOpenChat(c.id)}
              className="glass-panel w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 hover:border-violet-500/30"
            >
              {c.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
