"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={htmlFor}
        className="text-[13px] font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="text-destructive ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      {children}

      {error ? (
        <p className="text-[12px] text-destructive leading-tight">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-muted-foreground leading-tight">
          {hint}
        </p>
      ) : null}
    </div>
  );
}