import * as React from "react";

import { cn } from "./utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
<<<<<<< HEAD
        // Borders carry separation; elevation is reserved for things that
        // genuinely float (popovers, dialogs).
        "bg-card text-card-foreground flex flex-col gap-6 rounded-lg border border-line",
=======
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
<<<<<<< HEAD
    <h3
      data-slot="card-title"
      className={cn("t-h3", className)}
=======
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
<<<<<<< HEAD
      className={cn("text-sm text-ink-3", className)}
=======
      className={cn("text-muted-foreground", className)}
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
