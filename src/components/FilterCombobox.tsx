import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

interface FilterComboboxProps {
  value: string;
  onValueChange: (val: string) => void;
  options: string[];
  placeholder: string;
  className?: string;
}

export const FilterCombobox = ({
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: FilterComboboxProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between font-normal hover:border-primary/50 transition-all duration-200 text-left px-3",
            className
          )}
        >
          <span className="truncate flex-1">
            {value === "ALL" ? placeholder : value}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]" align="start">
        <Command>
          <CommandInput placeholder={`Cari ${placeholder}...`} className="h-9" />
          <CommandList>
            <CommandEmpty>{placeholder} tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="ALL"
                onSelect={() => {
                  onValueChange("ALL");
                  setOpen(false);
                }}
                className="cursor-pointer border-b border-border/50"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "ALL" ? "opacity-100" : "opacity-0"
                  )}
                />
                {placeholder}
              </CommandItem>

              {options.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onValueChange(opt);
                    setOpen(false);
                  }}
                  className="cursor-pointer border-b border-border/50 last:border-0"
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
  );
};