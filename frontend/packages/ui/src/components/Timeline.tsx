export type TimelineItem = { id: string; title: string; at: string; body?: string };

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="space-y-4">
      {items.map((it) => (
        <li key={it.id} className="border-l-2 border-border pl-4">
          <p className="text-sm font-medium text-text">{it.title}</p>
          <p className="text-xs text-text-muted">{it.at}</p>
          {it.body ? <p className="mt-1 text-sm text-text-muted">{it.body}</p> : null}
        </li>
      ))}
    </ol>
  );
}
