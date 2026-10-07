import type { ReactNode } from "react";
import { EmptyInstances, EmptySshKeys, EmptyGeneric } from "./EmptyStateIllustrations";

export type EmptyStateVariant = "instances" | "ssh-keys" | "generic";

export function EmptyState({
  title,
  body,
  action,
  icon,
  variant = "generic",
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
  variant?: EmptyStateVariant;
}) {
  const defaultIcon = (
    <>
      {variant === "instances" && <EmptyInstances className="text-text-muted/50" />}
      {variant === "ssh-keys" && <EmptySshKeys className="text-text-muted/50" />}
      {variant === "generic" && <EmptyGeneric className="text-text-muted/50" />}
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border-subtle bg-card px-6 py-14 text-center">
      <div className="mb-1 text-text-muted/50">{icon ?? defaultIcon}</div>
      <h3 className="text-[14px] font-medium text-text">{title}</h3>
      <p className="max-w-sm text-[13px] text-text-muted">{body}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}