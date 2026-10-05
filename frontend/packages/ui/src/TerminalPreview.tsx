"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react/dist/ssr";

function highlightLine(line: string): React.ReactNode {
  // Match prompt like "root@server:~# " or "$ "
  const promptMatch = line.match(/^(\s*)((?:root@[\w\-\.]+:[\w\-\~]+[#$]|[$#])\s?)(.*)$/);
  if (promptMatch) {
    const indent = promptMatch[1] ?? "";
    const prompt = promptMatch[2] ?? "";
    const rest = promptMatch[3] ?? "";
    return (
      <>
        <span className="text-text-muted">{indent}</span>
        <span className="text-accent">{prompt}</span>
        {highlightCommand(rest)}
      </>
    );
  }

  if (line.trim().startsWith("#")) {
    return <span className="text-text-muted/70 italic">{line}</span>;
  }

  return highlightOutput(line);
}

function highlightCommand(text: string): React.ReactNode {
  const tokens = text.split(/(\s+|&&|\|\||;|<|>|\||`|\$\(|\$\{|\$\w+|\$\d+)/).filter(Boolean);

  return tokens.map((token, i) => {
    if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
    if (/^(&&|\|\||;)$/.test(token)) return <span key={i} className="text-accent">{token}</span>;
    if (/^[<>|]$/.test(token)) return <span key={i} className="text-accent">{token}</span>;
    if (/^`|^\$\(|^\$\{/.test(token)) return <span key={i} className="text-yellow-400">{token}</span>;
    if (/^\$\w+|^\$\d+/.test(token)) return <span key={i} className="text-yellow-400">{token}</span>;
    if (/^\-{1,2}[\w-]+/.test(token)) return <span key={i} className="text-cyan-400">{token}</span>;
    if (/^[~\/].*\.[\w]+|^[~\/][\w\-\/\.]*/.test(token) && !/^\s/.test(token)) {
      return (
        <span key={i} className="text-green-400">
          {token}
        </span>
      );
    }
    if (/^[\w-]+=/.test(token)) return <span key={i} className="text-orange-400">{token}</span>;
    if (/^\d+$/.test(token)) return <span key={i} className="text-purple-400">{token}</span>;
    return (
      <span key={i} className="text-text">
        {token}
      </span>
    );
  });
}

function highlightOutput(text: string): React.ReactNode {
  const tokens = text
    .split(
      /(\s+|https?:\/\/[^\s]+|[\w.-]+@[\w.-]+\.\w+|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\b\d+\.\d+\.\d+\b|error|Error|ERROR|warning|Warning|WARN|success|Success|OK|FAIL|fail|Fail)/gi,
    )
    .filter(Boolean);

  return tokens.map((token, i) => {
    if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;
    if (/https?:\/\/[^\s]+/.test(token)) return <span key={i} className="text-blue-400 underline">{token}</span>;
    if (/[\w.-]+@[\w.-]+\.\w+/.test(token)) return <span key={i} className="text-cyan-400">{token}</span>;
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(token)) return <span key={i} className="text-green-400">{token}</span>;
    if (/^\d+\.\d+\.\d+$/.test(token)) return <span key={i} className="text-purple-400">{token}</span>;
    if (/^(error|Error|ERROR|FAIL|fail|Fail)$/i.test(token)) {
      return (
        <span key={i} className="font-medium text-red-400">
          {token}
        </span>
      );
    }
    if (/^(warning|Warning|WARN)$/i.test(token)) {
      return (
        <span key={i} className="font-medium text-yellow-400">
          {token}
        </span>
      );
    }
    if (/^(success|Success|OK)$/i.test(token)) {
      return (
        <span key={i} className="font-medium text-green-400">
          {token}
        </span>
      );
    }
    return (
      <span key={i} className="text-text-secondary">
        {token}
      </span>
    );
  });
}

export type TerminalPreviewProps = {
  lines: string[];
  showLineNumbers?: boolean;
  /** Shown in the header chip. Defaults to "bash". */
  language?: string;
  /** Optional title that replaces the language label. */
  title?: string;
};

/**
 * Docs/marketing code snippet. Each line is its own CSS grid row so the
 * gutter number always stays beside that line (never stacked above the block).
 */
export function TerminalPreview({
  lines,
  showLineNumbers = false,
  language = "bash",
  title,
}: TerminalPreviewProps) {
  const [copied, setCopied] = useState(false);
  const content = lines.join("\n");
  const label = title ?? language;
  const gutterWidth = String(Math.max(lines.length, 1)).length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="nc-code-block group relative my-4 overflow-hidden rounded-lg border border-border bg-[#0a0a0a]">
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-surface/50 px-3 py-2">
        <span className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-text-muted">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border/70 bg-bg/80 px-2 py-1 text-[10px] font-medium text-text-muted transition-colors hover:border-border hover:bg-surface-hover hover:text-text"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check size={12} weight="bold" className="text-success" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} weight="bold" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div
        role="region"
        aria-label={`${label} code snippet`}
        className="overflow-x-auto py-3 text-[12px] leading-6 text-text"
        style={{ fontFamily: "var(--font-mono), ui-monospace, monospace" }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className="grid items-start"
            style={{
              gridTemplateColumns: showLineNumbers
                ? `minmax(${Math.max(gutterWidth + 1, 2)}ch, auto) minmax(0, 1fr)`
                : "minmax(0, 1fr)",
            }}
          >
            {showLineNumbers && (
              <span
                aria-hidden="true"
                className="select-none border-r border-border/50 px-3 text-right tabular-nums text-text-muted/40"
              >
                {i + 1}
              </span>
            )}
            <span
              className={`min-w-0 whitespace-pre pr-4 ${showLineNumbers ? "pl-3" : "pl-4"}`}
            >
              {highlightLine(line) || "\u00A0"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
