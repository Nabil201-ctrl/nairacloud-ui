import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: { default: "Account \u00b7 NairaCloud", template: "%s \u00b7 NairaCloud" },
};

export default function RootAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-[100dvh] w-full bg-bg text-text">{children}</div>;
}
