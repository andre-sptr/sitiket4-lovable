import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        open: "border-transparent bg-status-open text-white",
        assigned: "border-transparent bg-status-assigned text-white",
        onprogress: "border-transparent bg-status-onprogress text-white",
        temporary: "border-transparent bg-status-temporary text-white",
        waiting: "border-transparent bg-status-waiting text-black",
        pending: "border-transparent bg-status-pending text-white",
        closed: "border-transparent bg-status-closed text-white",
        overdue: "border-transparent bg-status-overdue text-white animate-pulse",
        comply: "border-emerald-200 bg-emerald-100 text-emerald-700",
        notcomply: "border-red-200 bg-red-100 text-red-700",
        critical: "border-transparent bg-red-500 text-white animate-pulse",
        warning: "border-transparent bg-amber-500 text-white",
        info: "border-transparent bg-blue-500 text-white",
        success: "border-transparent bg-emerald-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
