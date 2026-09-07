"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "./utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    trackColor?: string;
    thumbColor?: string;
  }
<<<<<<< HEAD
>(({ className, trackColor = "bg-accent", thumbColor = "border-accent", ...props }, ref) => {
=======
>(({ className, trackColor = "bg-primary", thumbColor = "border-primary", ...props }, ref) => {
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
  const _values = React.useMemo(
    () =>
      Array.isArray(props.value)
        ? props.value
        : Array.isArray(props.defaultValue)
          ? props.defaultValue
          : [props.min ?? 0, props.max ?? 100],
    [props.value, props.defaultValue, props.min, props.max],
  );

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
<<<<<<< HEAD
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
=======
          "bg-slate-200 dark:bg-slate-800 relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5",
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            trackColor
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
<<<<<<< HEAD
            // 20px visual thumb; the Radix root gives it a larger hit area.
            "bg-surface block size-5 shrink-0 rounded-full border-[3px] shadow-[0_1px_3px_rgba(20,23,26,0.15)] transition-[border-color,box-shadow] duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
=======
            "bg-white dark:bg-slate-900 ring-ring/50 block size-6 shrink-0 rounded-full border-4 shadow-md transition-[color,box-shadow,transform] hover:scale-110 hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
>>>>>>> 80ee90a862b7dedebe251cf75dbd96f823a8ae50
            thumbColor
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider };
