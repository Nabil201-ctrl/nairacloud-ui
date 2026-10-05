import { DOCS } from "@/lib/docs";

export type DocNavItem = {
  slug: string;
  title: string;
  description: string;
};

export type DocNavSection = {
  label: string;
  slugs: string[];
};

/** Sidebar / index section order. Slugs must exist in DOCS. */
export const DOC_NAV_SECTIONS: DocNavSection[] = [
  {
    label: "Getting started",
    slugs: ["getting-started", "account", "creating-an-instance", "ssh-access"],
  },
  {
    label: "Networking & ops",
    slugs: ["networking-firewall", "docker-caddy", "vps-monitoring"],
  },
  {
    label: "Billing",
    slugs: ["billing-subscriptions"],
  },
  {
    label: "Reference",
    slugs: ["api-reference"],
  },
];

function docBySlug(slug: string) {
  return DOCS.find((d) => d.slug === slug);
}

export function getDocNavSections(): Array<DocNavSection & { items: DocNavItem[] }> {
  return DOC_NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.slugs
      .map((slug) => {
        const doc = docBySlug(slug);
        if (!doc) return null;
        return { slug: doc.slug, title: doc.title, description: doc.description };
      })
      .filter((item): item is DocNavItem => item !== null),
  }));
}

export function getSectionLabelForSlug(slug: string): string | null {
  for (const section of DOC_NAV_SECTIONS) {
    if (section.slugs.includes(slug)) return section.label;
  }
  return null;
}

export type DocSearchResult = {
  title: string;
  href: string;
  description: string;
  section: string;
};

export function getDocsSearchIndex(): DocSearchResult[] {
  return getDocNavSections().flatMap((section) =>
    section.items.map((item) => ({
      title: item.title,
      href: `/docs/${item.slug}`,
      description: item.description,
      section: section.label,
    }))
  );
}
