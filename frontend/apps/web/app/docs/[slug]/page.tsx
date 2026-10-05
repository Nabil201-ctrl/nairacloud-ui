import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DOCS } from "@/lib/docs";
import { DocPageClient } from "./doc-page-client";

export const dynamicParams = false;

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const doc = DOCS.find((d) => d.slug === params.slug);
  if (!doc) return { title: "Not found" };
  return { title: doc.title, description: doc.description, alternates: { canonical: `/docs/${doc.slug}` } };
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const i = DOCS.findIndex((d) => d.slug === params.slug);
  if (i === -1) notFound();
  const doc = DOCS[i] as NonNullable<(typeof DOCS)[number]>;
  const prev = DOCS[i - 1];
  const next = DOCS[i + 1];

  return <DocPageClient doc={doc} prev={prev} next={next} />;
}
