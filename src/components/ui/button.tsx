import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// Only the properties that actually change are transitioned â€” never `all`,
// which would also animate layout/transform properties unintentionally.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 disabled:pointer-events-none disabled:opacity-50 transition-[background-color,border-color,color] duration-[120ms] ease-[cubic-bezier(0.2,0.6,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-accent-ink hover:bg-accent-hover",
        destructive:
          "bg-destructive text-white hover:opacity-90",
        outline:
          "border border-line-2 bg-surface text-ink hover:bg-surface-2 hover:border-ink-3",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-muted",
        ghost: "text-ink-2 hover:bg-secondary hover:text-ink",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        // Touch targets: default 40px, primary CTAs 48px, icon buttons 40px.
        default: "h-10 px-4 py-2 has-[>svg]:px-3.5",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-12 rounded-md px-6 text-[0.9375rem] has-[>svg]:px-5",
        icon: "size-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
