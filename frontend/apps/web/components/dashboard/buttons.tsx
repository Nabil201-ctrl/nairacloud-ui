"use client";

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import { cn } from "@nairacloud/ui";

const primaryClass =
  "press inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-white px-3.5 text-[13px] font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40";

const secondaryClass =
  "press inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-border-secondary bg-surface px-3.5 text-[13px] font-medium text-white transition-colors hover:border-border hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { className?: string };

export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(function PrimaryButton(
  { className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn(primaryClass, className)} {...props} />;
});

export const SecondaryButton = forwardRef<HTMLButtonElement, ButtonProps>(function SecondaryButton(
  { className, type = "button", ...props },
  ref,
) {
  return <button ref={ref} type={type} className={cn(secondaryClass, className)} {...props} />;
});

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: "primary" | "secondary" };

export function LinkButton({ className, variant = "primary", ...props }: LinkButtonProps) {
  return <a className={cn(variant === "primary" ? primaryClass : secondaryClass, className)} {...props} />;
}
