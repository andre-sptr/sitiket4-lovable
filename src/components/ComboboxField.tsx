import { useState } from "react";
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";

interface ComboboxFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export const ComboboxField = ({
  label, 
  value, 
  options, 
  onChange, 
  onBlur,
  error, 
  required = false,
  placeholder = "Pilih..." 
}: ComboboxFieldProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-10 px-3 text-left bg-muted/50 border-transparent hover:border-border hover:bg-muted/70 transition-all duration-200 font-normal",
              error && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
            )}
          >
            {value
              ? options.find((opt) => opt === value) || value
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Cari ${label}...`} className="h-9" />
            <CommandList>
              <CommandEmpty>{label} tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt}
                    value={opt}
                    onSelect={(currentValue) => {
                      onChange(opt); 
                      setOpen(false);
                      if (onBlur) onBlur();
                    }}
                    className="cursor-pointer border-b border-border/50 last:border-0 rounded-none"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs text-destructive flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};