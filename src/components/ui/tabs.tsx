"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
<<<<<<< HEAD
        "bg-muted text-ink-3 inline-flex h-11 w-fit items-center justify-center rounded-lg p-1 flex border border-line",
=======
        "bg-muted/70 text-muted-foreground inline-flex h-11 w-fit items-center justify-center rounded-full p-1 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-800/60 backdrop-blur-sm",
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
<<<<<<< HEAD
        "inline-flex h-full flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap text-ink-3 transition-[background-color,color,border-color] duration-[120ms] hover:text-ink data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:border-line data-[state=active]:shadow-[0_1px_2px_rgba(20,23,26,0.04)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
=======
        "data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-slate-200/60 dark:data-[state=active]:ring-slate-800/60 text-slate-700 dark:text-slate-300 inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent px-3 text-sm font-semibold whitespace-nowrap transition-all duration-300 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 relative z-10 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
