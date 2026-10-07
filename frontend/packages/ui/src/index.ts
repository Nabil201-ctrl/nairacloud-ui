/**
 * @nairacloud/ui public API. Apps import from "@nairacloud/ui" only.
 * Layers: lib (helpers) → primitives (shadcn) → components (NairaCloud).
 */

// ── lib ──────────────────────────────────────────────────────────────────
export { cn } from "./lib/utils";

// ── primitives (shadcn/ui, generated via `npm run ui:add`) ─────────────────
export * from "./primitives/accordion";
export * from "./primitives/alert";
export * from "./primitives/alert-dialog";
export * from "./primitives/avatar";
export * from "./primitives/badge";
export * from "./primitives/breadcrumb";
export * from "./primitives/button";
export * from "./primitives/card";
export * from "./primitives/checkbox";
export * from "./primitives/command";
export * from "./primitives/dialog";
export * from "./primitives/dropdown-menu";
export * from "./primitives/input";
export * from "./primitives/label";
export * from "./primitives/pagination";
export * from "./primitives/popover";
export * from "./primitives/progress";
export * from "./primitives/radio-group";
export * from "./primitives/scroll-area";
export * from "./primitives/select";
export * from "./primitives/separator";
export * from "./primitives/sheet";
export * from "./primitives/sonner";
export * from "./primitives/switch";
export * from "./primitives/table";
export * from "./primitives/tabs";
export * from "./primitives/textarea";
export * from "./primitives/toggle";
export * from "./primitives/toggle-group";
export * from "./primitives/tooltip";

// ── components (NairaCloud brand composites) ─────────────────────────────
export { StatusDot } from "./components/StatusDot";
export type { InstanceStatus } from "./components/StatusDot";
export { ResourceGauge } from "./components/ResourceGauge";
export { PlanCard } from "./components/PlanCard";
export type { Plan } from "./components/PlanCard";
export { CopyField } from "./components/CopyField";
export { TerminalPreview } from "./components/TerminalPreview";
export type { TerminalPreviewProps } from "./components/TerminalPreview";
export { EmptyState, type EmptyStateVariant } from "./components/EmptyState";
export { EmptyInstances, EmptySshKeys, EmptyGeneric } from "./components/EmptyStateIllustrations";
export { CapacityBanner } from "./components/CapacityBanner";
export { PriceTag, formatNaira } from "./components/PriceTag";
export { Timeline } from "./components/Timeline";
export type { TimelineItem } from "./components/Timeline";
export {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  GridSkeleton,
  StatGridSkeleton,
  PageHeaderSkeleton,
  EmptyStateSkeleton,
} from "./components/Skeleton";
export { LiveChatWidget, useLiveChat } from "./components/LiveChatWidget";
export type { LiveChatConfig, LiveChatProvider } from "./components/LiveChatWidget";
