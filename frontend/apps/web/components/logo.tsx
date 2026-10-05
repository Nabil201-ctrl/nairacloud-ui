"use client";

import Image from "next/image";
import { cn } from "@nairacloud/ui";

interface LogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  className,
  imageClassName,
  textClassName,
  showText = true,
  size = "md",
}: LogoProps) {
  const sizeMap = {
    sm: { img: 24, class: "h-6 w-6", text: "text-[15px]" },
    md: { img: 30, class: "h-7.5 w-7.5", text: "text-[17px]" },
    lg: { img: 36, class: "h-9 w-9", text: "text-lg" },
  };
  const s = sizeMap[size];

  return (
    <a
      href="/"
      className={cn("flex items-center gap-2.5 transition-opacity hover:opacity-90", className)}
      aria-label="NairaCloud home"
    >
      <Image
        src="/logo.png"
        alt="NairaCloud logo"
        width={s.img}
        height={s.img}
        priority
        className={cn("object-contain shrink-0", s.class, imageClassName)}
      />
      {showText && (
        <span className={cn("font-bold tracking-tight text-text", s.text, textClassName)}>
          NairaCloud
        </span>
      )}
    </a>
  );
}
