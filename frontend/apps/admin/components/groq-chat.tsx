"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@nairacloud/ui";
import { X, Terminal } from "@phosphor-icons/react";

interface Command {
  id: string;
  command: string;
  description: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

export function GroqAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCommands = [
    { id: "nav-dashboard", command: "Go to Dashboard", description: "Navigate to the main dashboard", category: "Navigation", shortcut: "⌘D", action: () => window.location.href = "/" },
    { id: "nav-nodes", command: "Go to Nodes", description: "View and manage compute nodes", category: "Navigation", shortcut: "⌘N", action: () => window.location.href = "/nodes" },
    { id: "nav-instances", command: "Go to Instances", description: "Manage running instances", category: "Navigation", shortcut: "⌘I", action: () => window.location.href = "/instances" },
    { id: "nav-customers", command: "Go to Customers", description: "View customer list", category: "Navigation", shortcut: "⌘C", action: () => window.location.href = "/customers" },
    { id: "nav-payments", command: "Go to Payments", description: "View payment history", category: "Navigation", shortcut: "⌘P", action: () => window.location.href = "/payments" },
    { id: "nav-settings", command: "Go to Settings", description: "Open admin settings", category: "Navigation", shortcut: "⌘S", action: () => window.location.href = "/settings" },
    { id: "node-reboot", command: "Reboot Selected Nodes", description: "Reboot selected compute nodes", category: "Node Actions", shortcut: "⌘R", action: () => alert("Select nodes first, then use bulk actions") },
    { id: "node-terminate", command: "Terminate Instances", description: "Terminate selected instances", category: "Node Actions", shortcut: "⌘T", action: () => alert("Select instances first") },
    { id: "node-ssh", command: "Open SSH Key Manager", description: "Manage SSH keys for nodes", category: "Node Actions", action: () => window.location.href = "/ssh-keys" },
    { id: "sys-refresh", command: "Refresh Page", description: "Refresh current page data", category: "System", shortcut: "⌘⇧R", action: () => window.location.reload() },
    { id: "sys-settings", command: "Open Settings", description: "Open admin settings panel", category: "System", action: () => window.location.href = "/settings" },
    { id: "sys-logs", command: "View Audit Logs", description: "View system audit logs", category: "System", action: () => window.location.href = "/audit-logs" },
    { id: "sys-incidents", command: "View Incidents", description: "View system incidents", category: "System", action: () => window.location.href = "/incidents" },
    { id: "ai-help", command: "Show Help", description: "Show available keyboard shortcuts", category: "AI Assistant", shortcut: "⌘/", action: () => {} },
    { id: "ai-toggle", command: "Toggle AI Mode", description: "Toggle proactive AI assistance", category: "AI Assistant", action: () => alert("Proactive AI mode toggled") },
    { id: "qa-reboot-all", command: "Reboot All Nodes", description: "Emergency reboot all nodes (CAUTION)", category: "Quick Actions", action: () => alert("⚠️ This will reboot ALL nodes. Use with extreme caution!") },
    { id: "qa-backup", command: "Backup Configuration", description: "Backup current configuration", category: "Quick Actions", action: () => alert("Backup feature coming soon") },
  ];


  const filteredCommands = allCommands
    .filter(cmd => 
      cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aMatch = a.command.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 0 : 1;
      const bMatch = b.command.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 0 : 1;
      return aMatch - bMatch;
    });

  const groupedCommands = filteredCommands.reduce((acc: Record<string, Command[]>, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category]!.push(cmd);
    return acc;
  }, {});

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setSearchQuery("");
        setSelectedIndex(0);
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, Object.values(groupedCommands).flat().length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        const commands = Object.values(groupedCommands).flat();
        if (commands[selectedIndex]) {
          commands[selectedIndex].action();
          setIsOpen(false);
          setSearchQuery("");
          setSelectedIndex(0);
        }
        break;
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || (e.shiftKey && e.key === "p"))) {
        e.preventDefault();
        setIsOpen(true);
        setSearchQuery("");
        setSelectedIndex(0);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-40 text-[10px] text-text-muted/50 font-mono hidden md:block animate-fade-in">
        <kbd className="px-1.5 py-0.5 bg-surface border border-border/40 rounded text-text-muted">⌘K</kbd>
        <span className="text-text-muted/40 ml-1">Open Command Palette</span>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-3 sm:items-center sm:p-6"
          onClick={() => { setIsOpen(false); setSearchQuery(""); setSelectedIndex(0); }}
        >
          <div
            className="relative mt-[12vh] w-full max-w-2xl animate-slide-down sm:mt-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-surface/95 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-border/40 bg-surface/80 px-4 py-3">
                <span className="flex-shrink-0 text-xl text-accent">⌘</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                  placeholder="Type a command or search..."
                  className="min-w-0 flex-1 border-none bg-transparent font-mono text-base text-text outline-none placeholder:text-text-muted"
                  autoFocus
                />
                <div className="hidden items-center gap-2 font-mono text-[10px] text-text-muted sm:flex">
                  <kbd className="rounded border border-border/40 bg-surface px-1.5 py-0.5">Esc</kbd>
                  <span className="text-text-muted/40">close</span>
                </div>
                <button
                  type="button"
                  className="press rounded-md border border-border/70 p-1.5 text-text-muted hover:bg-surface hover:text-text sm:hidden"
                  aria-label="Close command palette"
                  onClick={() => { setIsOpen(false); setSearchQuery(""); setSelectedIndex(0); }}
                >
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-[min(500px,70dvh)] overflow-y-auto scrollbar-none">
                {Object.keys(groupedCommands).length === 0 ? (
                  <div className="p-8 text-center text-text-muted">
                    <span className="text-text-muted/50">No commands found</span>
                  </div>
                ) : (
                  <>
                    {Object.entries(groupedCommands).map(([category, cmds]) => (
                      <div key={category}>
                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-text-muted/60 bg-surface/50 border-b border-border/30">
                          {category}
                        </div>
                        {cmds.map((cmd, idx) => {
                          const flatIndex = Object.values(groupedCommands).flat().findIndex(c => c.id === cmd.id);
                          const isSelected = flatIndex === selectedIndex;
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => cmd.action()}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${flatIndex === selectedIndex ? "bg-accent/10 border-l-2 border-accent" : ""}`}
                              onMouseEnter={() => {
                                const flatIndex = Object.values(groupedCommands).flat().findIndex(c => c.id === cmd.id);
                                setSelectedIndex(flatIndex);
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-text truncate">{cmd.command}</span>
                                  {cmd.shortcut && (
                                    <span className="text-[10px] font-mono text-text-muted/60 bg-surface border border-border/40 px-1.5 py-0.5 rounded">{cmd.shortcut}</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-text-muted/70 truncate">{cmd.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {cmd.shortcut && (
                                  <kbd className="text-[10px] font-mono text-text-muted/60 bg-surface border border-border/40 px-1.5 py-0.5 rounded">
                                    {cmd.shortcut}
                                  </kbd>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="px-4 py-3 border-t border-border/40 bg-surface/80 flex items-center justify-between text-[10px] text-text-muted">
              <div className="flex items-center gap-4 font-mono">
                <span>↑↓ Navigate</span>
                <span>⏎ Execute</span>
                <span>Esc Close</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent">★</span>
                <span>NairaCloud Command Palette</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
