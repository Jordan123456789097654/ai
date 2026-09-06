"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare, PanelLeftClose, PanelLeftOpen, Search, Trash2 } from "lucide-react";
import { apiFetch } from "../lib/api";

type ConversationSummary = { id: string; title: string; updatedAt: string };

export default function ChatSidebar({
  activeId,
  onSelect,
  onNew,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await apiFetch("/conversations");
      setConversations(data);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [activeId]);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className="border-r border-border p-3">
        <button onClick={() => setCollapsed(false)} className="text-muted hover:text-text">
          <PanelLeftOpen size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 shrink-0 border-r border-border flex flex-col h-[calc(100vh-73px)]">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <button
          onClick={onNew}
          className="flex items-center gap-2 text-sm px-3 py-1.5 rounded bg-accent text-ink font-medium"
        >
          <Plus size={14} /> New Chat
        </button>
        <button onClick={() => setCollapsed(true)} className="text-muted hover:text-text">
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-border">
        <div className="flex items-center gap-2 bg-surface border border-border rounded px-2.5 py-1.5 text-xs">
          <Search size={14} className="text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-transparent outline-none text-text"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {loading && <p className="text-muted text-xs px-3 py-2">Loading...</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-muted text-xs px-3 py-2">
            {search ? "No matching chats." : "No conversations yet."}
          </p>
        )}
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`w-full flex items-center gap-2 text-left px-3 py-2 text-sm truncate ${
              c.id === activeId ? "bg-surface-raised text-text font-medium" : "text-muted hover:text-text hover:bg-surface"
            }`}
          >
            <MessageSquare size={14} className="shrink-0 text-accent" />
            <span className="truncate flex-1">{c.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
