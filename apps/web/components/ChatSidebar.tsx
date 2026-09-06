"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare, PanelLeftClose, PanelLeftOpen, Search, Folder, FolderPlus, ChevronRight, ChevronDown } from "lucide-react";
import { apiFetch } from "../lib/api";

type ConversationSummary = { id: string; title: string; updatedAt: string; folderId?: string };

const DEFAULT_FOLDERS = [
  { id: "backend", name: "Backend Services" },
  { id: "frontend", name: "Frontend Apps" },
  { id: "database", name: "Database & SQL" },
];

export default function ChatSidebar({
  activeId,
  onSelect,
  onNew,
  onOpenSearch,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onOpenSearch?: () => void;
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>(DEFAULT_FOLDERS);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
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

  function addFolder() {
    if (!newFolderName.trim()) return;
    const newFolder = { id: `folder-${Date.now()}`, name: newFolderName.trim() };
    setFolders((prev) => [...prev, newFolder]);
    setNewFolderName("");
    setShowFolderInput(false);
  }

  function toggleFolder(id: string) {
    setCollapsedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  }

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFolderInput(!showFolderInput)}
            className="text-muted hover:text-text p-1"
            title="Create Folder"
          >
            <FolderPlus size={16} />
          </button>
          <button onClick={() => setCollapsed(true)} className="text-muted hover:text-text p-1">
            <PanelLeftClose size={16} />
          </button>
        </div>
      </div>

      {/* New Folder Input */}
      {showFolderInput && (
        <div className="p-2 border-b border-border flex gap-1 bg-surface-raised">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFolder()}
            placeholder="Folder name..."
            className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs outline-none focus:border-accent"
          />
          <button onClick={addFolder} className="px-2 py-1 bg-accent text-ink rounded text-xs font-semibold">
            Add
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="p-2 border-b border-border space-y-1">
        <div className="flex items-center gap-2 bg-surface border border-border rounded px-2.5 py-1.5 text-xs">
          <Search size={14} className="text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="w-full bg-transparent outline-none text-text"
          />
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="px-1.5 py-0.5 rounded bg-surface-raised border border-border text-[10px] text-accent font-mono hover:border-accent shrink-0"
              title="Global Deep Search across all threads & code"
            >
              Ctrl+K
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {loading && <p className="text-muted text-xs px-3 py-2">Loading...</p>}

        {/* Project Folders */}
        {!search && folders.map((f) => (
          <div key={f.id} className="space-y-0.5">
            <button
              onClick={() => toggleFolder(f.id)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-muted hover:text-text"
            >
              <div className="flex items-center gap-1.5">
                <Folder size={13} className="text-accent" />
                <span>{f.name}</span>
              </div>
              {collapsedFolders[f.id] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>

            {!collapsedFolders[f.id] && (
              <div className="pl-4 space-y-0.5 border-l border-border ml-4">
                <p className="text-[11px] text-muted/60 px-2 py-1 italic">Empty folder</p>
              </div>
            )}
          </div>
        ))}

        <div className="pt-2 border-t border-border mt-2">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-3 mb-1">All Chats</p>
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
    </div>
  );
}
