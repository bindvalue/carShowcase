"use client";

import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

interface ComboboxFieldProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ComboboxField({ className, ...props }: ComboboxFieldProps) {
  return <Combobox {...props} className={cn("h-11", className)} />;
}