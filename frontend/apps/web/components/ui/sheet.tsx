"use client";

import * as React from "react";
import { cn } from "@nairacloud/ui";
import { X } from "@phosphor-icons/react/dist/ssr";

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = React.createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const context = React.useContext(SheetContext);
  if (!context) throw new Error("Sheet components must be used within Sheet");
  return context;
}

const Sheet = ({
  children,
  open: openProp,
  onOpenChange,
}: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  return (
    <SheetContext.Provider value={{ open, onOpenChange: setOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

const SheetTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }>(
  ({ asChild, children, ...props }, ref) => {
    const { onOpenChange } = useSheetContext();
    const handleClick = () => onOpenChange(true);
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ...props,
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
          handleClick();
          props.onClick?.(e);
        },
        ref,
      });
    }
    
    return <button ref={ref} onClick={handleClick} {...props}>{children}</button>;
  }
);
SheetTrigger.displayName = "SheetTrigger";

const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: "left" | "right" | "top" | "bottom" }
>(({ side = "right", className, children, ...props }, ref) => {
  const { open, onOpenChange } = useSheetContext();
  
  if (!open) return null;

  const handleOverlayClick = () => onOpenChange(false);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onOpenChange(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/80 animate-in fade-in-0"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div
        ref={ref}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-bg p-6 shadow-lg animate-in duration-500",
          side === "left" && "left-0 top-0 h-full w-3/4 max-w-sm border-r border-border slide-in-from-left",
          side === "right" && "right-0 top-0 h-full w-3/4 max-w-sm border-l border-border slide-in-from-right",
          side === "top" && "left-0 top-0 w-full border-b border-border slide-in-from-top",
          side === "bottom" && "left-0 bottom-0 w-full border-t border-border slide-in-from-bottom",
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
    </>
  );
});
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<"h2">>(
  ({ className, ...props }, ref) => (
    <h2 className={cn("text-lg font-semibold text-text", className)} ref={ref} {...props} />
  )
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<"p">>(
  ({ className, ...props }, ref) => (
    <p className={cn("text-sm text-text-muted", className)} ref={ref} {...props} />
  )
);
SheetDescription.displayName = "SheetDescription";

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription };