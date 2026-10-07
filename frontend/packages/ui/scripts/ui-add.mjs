#!/usr/bin/env node
/**
 * `npm run ui:add -- <component...>` — shadcn add, then make the output on-brand.
 *
 * 1. Runs `shadcn add` (pinned to the last Tailwind v3 compatible CLI).
 * 2. Post-processes ONLY files that run created/changed (hand edits elsewhere
 *    are never touched):
 *    - lucide-react icons  -> Phosphor (one icon family, SOURCE_OF_TRUTH §4)
 *    - shadcn `accent` role -> surface-hover (our `accent` is the brand green)
 *    - shadcn `bg-muted`    -> surface       (our `muted` is a text gray)
 * 3. Removes lucide-react / next-themes if the CLI installed them.
 *
 * `node scripts/ui-add.mjs --postprocess <file...>` runs step 2 on given files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SHADCN = "shadcn@2.3.0";
const pkgDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(pkgDir, "src");

/** lucide name -> [phosphor name, extra JSX props] */
const ICONS = {
  Check: ["Check", 'weight="bold"'],
  ChevronDown: ["CaretDown"],
  ChevronUp: ["CaretUp"],
  ChevronLeft: ["CaretLeft"],
  ChevronRight: ["CaretRight"],
  ChevronsUpDown: ["CaretUpDown"],
  Circle: ["Circle", 'weight="fill"'],
  Dot: ["Dot"],
  X: ["X"],
  Search: ["MagnifyingGlass"],
  MoreHorizontal: ["DotsThree"],
  Minus: ["Minus"],
  GripVertical: ["DotsSixVertical"],
  PanelLeft: ["SidebarSimple"],
  ArrowLeft: ["ArrowLeft"],
  ArrowRight: ["ArrowRight"],
  Calendar: ["Calendar"],
};

const CLASS_REWRITES = [
  // shadcn@2.3.0 mangles scoped aliases: "@nairacloud/ui/lib/utils" -> "@nairacloud/lib/utils".
  [/(["'])@nairacloud\/lib\//g, "$1@nairacloud/ui/lib/"],
  // Menu/select separators: a hairline, not a surface.
  [/h-px bg-muted(?![\w-])/g, "h-px bg-border"],
  [/(?<=[\s"'`:])bg-accent(?![\w-])/g, "bg-surface-hover"],
  [/(?<=[\s"'`:])text-accent-foreground(?![\w-])/g, "text-text"],
  [/(?<=[\s"'`:])bg-muted(?![\w-])/g, "bg-surface"],
];

function postprocess(file) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;
  const problems = [];
  const renames = [];

  // Phosphor's /dist/ssr build works in both server and client components.
  src = src.replace(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["'];?/g, (_, names) => {
    const mapped = names
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean)
      .map((name) => {
        const target = ICONS[name.replace(/Icon$/, "")];
        if (!target) {
          problems.push(`unmapped icon ${name} (add it to ICONS)`);
          return name;
        }
        renames.push([name, ...target]);
        return target[0];
      });
    return `import { ${[...new Set(mapped)].join(", ")} } from "@phosphor-icons/react/dist/ssr";`;
  });
  for (const [from, to, props] of renames) {
    src = src.replace(new RegExp(`<${from}(?=[\\s/>])`, "g"), props ? `<${to} ${props}` : `<${to}`);
  }

  for (const [re, to] of CLASS_REWRITES) src = src.replace(re, to);

  if (/@radix-ui\/react-icons/.test(src)) problems.push("@radix-ui/react-icons import");
  if (/next-themes/.test(src)) problems.push("next-themes import (app is dark-only; hardcode theme)");

  if (src !== before) fs.writeFileSync(file, src);
  const rel = path.relative(pkgDir, file);
  if (problems.length) console.warn(`  ! ${rel}: fix by hand -> ${problems.join(", ")}`);
  else if (src !== before) console.log(`  ✓ ${rel}`);
}

function snapshot() {
  const out = new Map();
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx?|css)$/.test(e.name)) out.set(p, fs.statSync(p).mtimeMs);
    }
  };
  walk(srcDir);
  return out;
}

const args = process.argv.slice(2);
if (args[0] === "--postprocess") {
  for (const f of args.slice(1)) postprocess(path.resolve(f));
  process.exit(0);
}
if (!args.length) {
  console.error("usage: npm run ui:add -- <component...>   e.g. npm run ui:add -- hover-card");
  process.exit(1);
}

const before = snapshot();
execSync(`npx --yes ${SHADCN} add ${args.join(" ")}`, { cwd: pkgDir, stdio: "inherit" });
const changed = [...snapshot()].filter(([p, m]) => before.get(p) !== m).map(([p]) => p);

console.log("\nPost-processing for NairaCloud brand rules:");
changed.filter((f) => /\.tsx?$/.test(f)).forEach(postprocess);

const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"));
const stray = ["lucide-react", "next-themes"].filter((d) => pkg.dependencies?.[d]);
if (stray.length) {
  console.log(`Removing ${stray.join(", ")} (not used after post-processing)`);
  execSync(`npm uninstall ${stray.join(" ")}`, { cwd: pkgDir, stdio: "inherit" });
}
console.log("\nDone. Export new primitives from src/index.ts and review the diff.");
