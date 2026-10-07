import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UiKit } from "./ui-kit";

export const metadata: Metadata = {
  title: "UI kit",
  robots: { index: false, follow: false },
};

/** Dev-only reference for every @nairacloud/ui primitive and brand component. */
export default function UiKitPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <UiKit />;
}
