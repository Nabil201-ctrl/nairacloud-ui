"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@nairacloud/ui";
import { Eye, EyeSlash, CircleNotch } from "@phosphor-icons/react";
import { PrimaryButton } from "@/components/dashboard";

export const inputClass =
  "w-full h-9 rounded-sm border border-border bg-surface px-3 text-[13px] text-text placeholder:text-text-muted/50 transition-colors duration-150 focus:border-border-hover focus:outline-none focus:ring-1 focus:ring-accent/30 hover:border-border-hover";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[13px] font-medium text-text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-[12px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function PasswordInput({
  value,
  onChange,
  autoComplete = "current-password",
  placeholder = "••••••••••••",
  required = true,
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        className={cn(inputClass, "pr-10", className)}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text"
      >
        {show ? <EyeSlash size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export function Submit({
  pending,
  disabled = false,
  children,
  className,
}: {
  pending: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <PrimaryButton
      type="submit"
      disabled={pending || disabled}
      className={cn("w-full", className)}
    >
      {pending ? (
        <>
          <CircleNotch size={15} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </PrimaryButton>
  );
}
