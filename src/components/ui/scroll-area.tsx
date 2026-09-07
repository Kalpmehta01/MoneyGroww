"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area@1.2.3";

import { cn } from "./utils";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
<<<<<<< HEAD
      // min-h-0 matters: as a flex child, the default `min-height: auto`
      // resolves to the content's height, so the Root grows to fit all its
      // content instead of being bounded by the parent — and then nothing
      // ever scrolls inside it.
      className={cn("relative min-h-0", className)}
=======
      className={cn("relative", className)}
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
<<<<<<< HEAD
        // overscroll-contain stops the scroll chaining to the page when you
        // reach the top/bottom of this area.
        className="focus-visible:ring-ring/50 size-full overscroll-contain rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
=======
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
