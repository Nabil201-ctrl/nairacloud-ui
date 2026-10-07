# @nairacloud/ui

Shared UI for `apps/web` and `apps/admin`: shadcn/ui primitives plus the
NairaCloud brand components. Rules come from `frontend/SOURCE_OF_TRUTH.md` §3–4.

```
packages/ui/
├── components.json        shadcn CLI config (new-york, Tailwind v3)
├── scripts/ui-add.mjs     `npm run ui:add` — shadcn add + brand post-processing
└── src/
    ├── index.ts           public API — apps import from "@nairacloud/ui"
    ├── lib/utils.ts       cn()
    ├── hooks/             shared React hooks (created on demand)
    ├── primitives/        shadcn/ui, kebab-case files. Generated, then owned by us
    └── components/        NairaCloud composites, PascalCase files
                           (StatusDot, PlanCard, PriceTag, CopyField, …)
```

Tokens and the Tailwind preset live in `packages/config` (`tokens.css`,
`tailwind.preset.cjs`). That is the only place colors are defined.

## Using it

```tsx
import { Button, Dialog, DialogContent, StatusDot, PriceTag } from "@nairacloud/ui";
```

Deep imports work too (`@nairacloud/ui/primitives/button`), but prefer the barrel.

To see every primitive and variant, run `npm run dev:web` and open
<http://localhost:3001/ui-kit>. The page is dev-only and returns 404 in production.

## Layers: what goes where

| Layer | Folder | Rule |
|---|---|---|
| Primitive | `src/primitives` | Unstyled-by-intent building blocks from shadcn. No product logic, no API calls. |
| Composite | `src/components` | NairaCloud vocabulary built from primitives + tokens (`StatusDot`, `PlanCard`). Shared by both apps. |
| App component | `apps/*/components` | Uses app data, routes, or API (`instance-menu`, `admin-shell`). Never imported across apps. |

When an app component is needed by both apps and has no app-specific data, promote it into `src/components`.

## Adding a shadcn component

```bash
cd frontend
npm run ui:add -- hover-card          # one or more names
```

Then export it from `src/index.ts`. The script pins `shadcn@2.3.0` (the last
CLI for Tailwind v3) and rewrites **only the files it just created** so they
follow the brand rules:

| shadcn output | becomes | why |
|---|---|---|
| `lucide-react` icons | `@phosphor-icons/react/dist/ssr` | one icon family |
| `bg-accent`, `text-accent-foreground` (hover surface) | `bg-surface-hover`, `text-text` | our `accent` is the brand green |
| `bg-muted` | `bg-surface` | our `muted` is a text gray |

If it prints `! fix by hand`, the component used an icon or import the script
doesn't know yet. Add the icon to `ICONS` in the script, or edit the file by hand.

Do **not** run `shadcn init`. It would overwrite `tokens.css` and the preset.

## Tokens: shadcn roles → NairaCloud palette

| shadcn class | token | value |
|---|---|---|
| `bg-background` / `text-foreground` | `--bg` / `--text` | page |
| `bg-card` | `--card` | cards |
| `bg-popover` | `--control` | menus, popovers, selects |
| `bg-primary` / `text-primary-foreground` | `--text` / `--bg` | white primary CTA (brand rule) |
| `bg-secondary` | `--surface` | secondary buttons |
| `text-muted-foreground` | `--text-muted` | helper text |
| `bg-destructive` | `--danger` | destructive actions |
| `border-input` | `--border-control` | form controls |
| `ring-ring` | `--accent` | focus rings |

Every color supports opacity modifiers (`bg-accent/10`, `border-danger/40`).

## Conventions

- **Colors:** tokens only. No raw hex, no `text-gray-*`, no arbitrary `bg-[#…]`.
- **Brand green (`accent`):** small highlights only (live status, selected tab,
  chart line). Never fill a card with it. Primary CTA is `<Button>` (white).
- **Money:** always `<PriceTag>` / `formatNaira()`. That means `₦`, mono font, commas.
- **Mono:** IPs, hostnames, specs, prices, and code go in `font-mono`.
- **Icons:** Phosphor only. Import from `@phosphor-icons/react/dist/ssr` so they work in server components.
- **Destructive actions:** use `<AlertDialog>`. Deleting an instance also requires typing the hostname.
- **Variants over overrides:** if you pass the same `className` to a primitive
  in three places, add a `cva` variant to the primitive instead.
- **Client boundaries:** primitives that need it already declare `"use client"`.
  Server components can import from the barrel.
