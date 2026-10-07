"use client";

import { useState, type ReactNode } from "react";
import {
  CaretDown,
  Cube,
  DotsThree,
  Gear,
  Key,
  Plus,
  Terminal,
  Trash,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  CapacityBanner,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  CopyField,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Input,
  Label,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PlanCard,
  Popover,
  PopoverContent,
  PopoverTrigger,
  PriceTag,
  Progress,
  RadioGroup,
  RadioGroupItem,
  ResourceGauge,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  StatusDot,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Timeline,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
  type Plan,
} from "@nairacloud/ui";

const SWATCHES: { group: string; items: [label: string, className: string][] }[] = [
  {
    group: "Surfaces",
    items: [
      ["bg", "bg-bg"],
      ["sidebar", "bg-sidebar"],
      ["main", "bg-main"],
      ["card", "bg-card"],
      ["surface", "bg-surface"],
      ["surface-hover", "bg-surface-hover"],
      ["control / popover", "bg-control"],
      ["nav-active", "bg-nav-active"],
    ],
  },
  {
    group: "Text",
    items: [
      ["text", "bg-text"],
      ["text-secondary", "bg-text-secondary"],
      ["text-muted", "bg-text-muted"],
      ["text-disabled", "bg-text-disabled"],
    ],
  },
  {
    group: "Signal",
    items: [
      ["accent (brand)", "bg-accent"],
      ["accent/10", "bg-accent/10"],
      ["danger", "bg-danger"],
      ["warning", "bg-warning"],
      ["info", "bg-info"],
    ],
  },
];

const PLANS: Plan[] = [
  { id: "starter", name: "STARTER", price: 4500, cpu: "1 vCPU", ram: "1 GB", storage: "25 GB", badge: "Most popular" },
  { id: "basic", name: "BASIC", price: 9000, cpu: "2 vCPU", ram: "2 GB", storage: "50 GB" },
  { id: "pro", name: "PRO", price: 36000, cpu: "4 vCPU", ram: "8 GB", storage: "160 GB", disabled: true },
];

const INSTANCES = [
  { host: "api-prod-01", status: "RUNNING", plan: "BASIC", ip: "102.89.4.12:2201", price: 9000 },
  { host: "staging-bot", status: "CREATING", plan: "STARTER", ip: "102.89.4.12:2202", price: 4500 },
  { host: "old-blog", status: "STOPPED", plan: "STARTER", ip: "102.89.4.12:2203", price: 4500 },
  { host: "worker-3", status: "ERROR", plan: "BASIC", ip: "102.89.4.12:2204", price: 9000 },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 space-y-4">
      <h2 className="text-lg font-semibold tracking-tight text-text">{title}</h2>
      <div className="rounded-lg border bg-card p-6">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <span className="w-32 shrink-0 font-mono text-[11px] uppercase tracking-wider text-text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const NAV = ["tokens", "buttons", "forms", "overlays", "navigation", "feedback", "data", "brand"];

export function UiKit() {
  const [plan, setPlan] = useState("starter");
  const [confirmText, setConfirmText] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-10 space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">Dev only · @nairacloud/ui</p>
        <h1 className="text-2xl font-semibold tracking-tight">UI kit</h1>
        <p className="max-w-[65ch] text-sm text-text-secondary">
          Every primitive and brand component, rendered with the real tokens. Check new components here before using them in a page.
        </p>
        <nav className="flex flex-wrap gap-2 pt-2">
          {NAV.map((id) => (
            <a key={id} href={`#${id}`} className="rounded-sm border px-2.5 py-1 font-mono text-[11px] text-text-muted hover:text-text">
              {id}
            </a>
          ))}
        </nav>
      </header>

      <div className="space-y-12">
        <Section id="tokens" title="Tokens">
          <div className="space-y-6">
            {SWATCHES.map(({ group, items }) => (
              <div key={group}>
                <p className="mb-3 text-sm text-text-secondary">{group}</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                  {items.map(([label, cls]) => (
                    <div key={label} className="space-y-1.5">
                      <div className={`h-12 rounded-md border ${cls}`} />
                      <p className="font-mono text-[10px] text-text-muted">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Separator />
            <div className="space-y-1">
              <p className="text-sm">Sans: interface text, labels, headings.</p>
              <p className="font-mono text-sm text-text-secondary">Mono: 102.89.4.12 · api-prod-01.nairacloud.app · 2 vCPU / 4 GB</p>
              <PriceTag amount={1250000} className="text-xl font-medium" />
            </div>
          </div>
        </Section>

        <Section id="buttons" title="Buttons & badges">
          <div className="divide-y">
            <Row label="Variants">
              <Button>Deploy instance</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="link">Link</Button>
            </Row>
            <Row label="Sizes">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" variant="outline" aria-label="Settings">
                <Gear className="h-4 w-4" />
              </Button>
            </Row>
            <Row label="States">
              <Button>
                <Plus className="h-4 w-4" /> With icon
              </Button>
              <Button disabled>Disabled</Button>
            </Row>
            <Row label="Badges">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Failed</Badge>
            </Row>
          </div>
        </Section>

        <Section id="forms" title="Form controls">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="kit-hostname">Hostname</Label>
              <Input id="kit-hostname" placeholder="my-server" className="font-mono" />
              <p className="text-xs text-muted-foreground">Lowercase letters, numbers and hyphens.</p>
            </div>
            <div className="space-y-2">
              <Label>Operating system</Label>
              <Select defaultValue="ubuntu-24.04">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ubuntu-22.04">Ubuntu 22.04</SelectItem>
                  <SelectItem value="ubuntu-24.04">Ubuntu 24.04</SelectItem>
                  <SelectItem value="debian-12">Debian 12</SelectItem>
                  <SelectItem value="almalinux-9">AlmaLinux 9</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="kit-key">Public SSH key</Label>
              <Textarea id="kit-key" placeholder="ssh-ed25519 AAAA…" className="font-mono" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="kit-terms" />
              <Label htmlFor="kit-terms">I accept the acceptable use policy</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="kit-email" defaultChecked />
              <Label htmlFor="kit-email">Email me when an instance stops</Label>
            </div>
            <RadioGroup defaultValue="card" className="md:col-span-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="card" id="kit-card" />
                <Label htmlFor="kit-card">Card (Paystack)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="wallet" id="kit-wallet" />
                <Label htmlFor="kit-wallet">Wallet balance</Label>
              </div>
            </RadioGroup>
          </div>
        </Section>

        <Section id="overlays" title="Overlays">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add SSH key</DialogTitle>
                  <DialogDescription>Paste the public half of your key. It never leaves your account.</DialogDescription>
                </DialogHeader>
                <Textarea placeholder="ssh-ed25519 AAAA…" className="font-mono" />
                <DialogFooter>
                  <Button>Add key</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog onOpenChange={() => setConfirmText("")}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="h-4 w-4" /> Delete instance
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete api-prod-01?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This destroys the instance and its disk. Type <span className="font-mono text-text">api-prod-01</span> to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="font-mono" aria-label="Hostname" />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction disabled={confirmText !== "api-prod-01"} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet</Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetDescription>Mobile sidebar pattern.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Popover</Button>
              </PopoverTrigger>
              <PopoverContent className="space-y-2">
                <p className="text-sm font-medium">Connect</p>
                <CopyField label="SSH command" value="ssh root@102.89.4.12 -p 2201" />
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Tooltip</Button>
              </TooltipTrigger>
              <TooltipContent>Restart keeps the IP and disk</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Dropdown <CaretDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>api-prod-01</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Terminal className="h-4 w-4" /> Console
                </DropdownMenuItem>
                <DropdownMenuItem>Restart</DropdownMenuItem>
                <DropdownMenuItem>Stop</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-danger focus:text-danger">
                  <Trash className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={() => setPaletteOpen(true)}>
              Command palette <kbd className="ml-1 font-mono text-[10px] text-text-muted">⌘K</kbd>
            </Button>
            <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
              <CommandInput placeholder="Search instances, docs, settings…" />
              <CommandList>
                <CommandEmpty>No results.</CommandEmpty>
                <CommandGroup heading="Instances">
                  <CommandItem>
                    <Cube className="h-4 w-4" /> api-prod-01
                  </CommandItem>
                  <CommandItem>
                    <Cube className="h-4 w-4" /> staging-bot
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Go to">
                  <CommandItem>
                    <Key className="h-4 w-4" /> SSH keys <CommandShortcut>G K</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </div>
        </Section>

        <Section id="navigation" title="Navigation">
          <div className="space-y-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#navigation">Instances</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-mono">api-prod-01</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="console">Console</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="text-sm text-text-secondary">Overview tab content.</TabsContent>
              <TabsContent value="console" className="text-sm text-text-secondary">Console tab content.</TabsContent>
              <TabsContent value="metrics" className="text-sm text-text-secondary">Metrics tab content.</TabsContent>
              <TabsContent value="settings" className="text-sm text-text-secondary">Settings tab content.</TabsContent>
            </Tabs>
            <ToggleGroup type="single" defaultValue="24h" variant="outline" size="sm" className="justify-start">
              <ToggleGroupItem value="1h">1h</ToggleGroupItem>
              <ToggleGroupItem value="24h">24h</ToggleGroupItem>
              <ToggleGroupItem value="7d">7d</ToggleGroupItem>
            </ToggleGroup>
            <Pagination className="justify-start">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#navigation" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#navigation" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#navigation">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#navigation" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Section>

        <Section id="feedback" title="Feedback">
          <div className="space-y-4">
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Provisioning</AlertTitle>
              <AlertDescription>Your instance is booting. This usually takes under a minute.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <Warning className="h-4 w-4" />
              <AlertTitle>Payment failed</AlertTitle>
              <AlertDescription>Update your card. 2 days left before suspension.</AlertDescription>
            </Alert>
            <Progress value={62} aria-label="Provisioning progress" />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => toast.success("Instance restarted")}>
                Success toast
              </Button>
              <Button variant="outline" onClick={() => toast.error("Could not reach the node. Try again.")}>
                Error toast
              </Button>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </Section>

        <Section id="data" title="Data display">
          <div className="space-y-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {INSTANCES.map((i) => (
                  <TableRow key={i.host}>
                    <TableCell className="font-mono">{i.host}</TableCell>
                    <TableCell>
                      <StatusDot status={i.status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{i.plan}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-text-secondary">{i.ip}</TableCell>
                    <TableCell className="text-right">
                      <PriceTag amount={i.price} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${i.host}`}>
                        <DotsThree className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>api-prod-01</CardTitle>
                  <CardDescription>BASIC · Ubuntu 24.04</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ResourceGauge label="CPU" pct={34} />
                  <ResourceGauge label="Memory" pct={71} />
                </CardContent>
                <CardFooter className="justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[11px]">PK</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-text-secondary">Owner</span>
                  </div>
                  <Button size="sm" variant="secondary">
                    Open
                  </Button>
                </CardFooter>
              </Card>
              <Accordion type="single" collapsible>
                <AccordionItem value="limit">
                  <AccordionTrigger>Why is PRO limited?</AccordionTrigger>
                  <AccordionContent>We only sell capacity we have. PRO opens again when a node frees up.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="pay">
                  <AccordionTrigger>What payment methods?</AccordionTrigger>
                  <AccordionContent>Cards, bank transfer and USSD through Paystack, billed in naira.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <ScrollArea className="h-32 rounded-md border p-4">
              <div className="space-y-1 font-mono text-xs text-text-secondary">
                {Array.from({ length: 20 }, (_, n) => (
                  <p key={n}>[{String(n).padStart(2, "0")}:00] agent heartbeat ok</p>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Section>

        <Section id="brand" title="NairaCloud components">
          <div className="space-y-8">
            <Row label="StatusDot">
              {["RUNNING", "CREATING", "STOPPED", "SUSPENDED", "ERROR"].map((s) => (
                <StatusDot key={s} status={s} />
              ))}
            </Row>
            <div className="grid gap-3 md:grid-cols-3">
              {PLANS.map((p) => (
                <PlanCard key={p.id} plan={p} selected={plan === p.id} onSelect={setPlan} />
              ))}
            </div>
            <CapacityBanner plan="PRO" />
            <EmptyState
              variant="instances"
              title="No instances yet"
              body="Deploy your first server. It is billed in naira and online in minutes."
              action={
                <Button>
                  <Plus className="h-4 w-4" /> Deploy instance
                </Button>
              }
            />
            <Timeline
              items={[
                { id: "1", title: "Instance created", at: "2 min ago" },
                { id: "2", title: "Payment verified", at: "3 min ago", body: "₦9,000 · Paystack ref NC-81F2" },
              ]}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
