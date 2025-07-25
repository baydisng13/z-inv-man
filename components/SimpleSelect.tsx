"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

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
import { Input } from "@/components/ui/input";

interface SimpleSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyStateText?: string;
  options: { label: string; value: string }[];
  popoverContentClassName?: string;
  isLoading?: boolean;
  disabledKeys?: any[];
}

export const SimpleSelect: React.FC<SimpleSelectProps> = ({
  name,
  label,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyStateText = "No results found.",
  options,
  popoverContentClassName = "w-[270px]",
  isLoading,
  disabledKeys,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { control, setValue, watch } = useFormContext();

  const selectedValue = watch(name);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  return (
    <div className="w-full">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            {label && <label className="text-sm font-medium">{label}</label>}

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between h-8 text-xs",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {selectedValue
                    ? options.find((option) => option.value === selectedValue)
                        ?.label
                    : placeholder}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn("p-0", popoverContentClassName)}>
                <Command>
                  <div className="relative flex items-center">
                    <CommandInput
                      placeholder={searchPlaceholder}
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      className="pl-8"
                    />
                  </div>
                  <CommandList>
                    <CommandEmpty>{emptyStateText}</CommandEmpty>
                    <CommandGroup>
                      {isLoading ? (
                        <div className="py-2 px-3 text-sm text-muted-foreground">
                          Loading...
                        </div>
                      ) : (
                      filteredOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            setValue(name, option.value);
                            setOpen(false);
                          }}
                          
                          {...(disabledKeys ? {disabled:disabledKeys.includes(option.value)} : {})}
                        >
                          {option.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              option.value === selectedValue
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      )))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
      />
    </div>
  );
};
