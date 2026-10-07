"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { TooltipProvider } from "@nairacloud/ui";
import { RealtimeProvider } from "./realtime-provider";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } }));
  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={200}>
        <RealtimeProvider>{children}</RealtimeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
