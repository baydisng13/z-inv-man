"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Controller } from "react-hook-form";

// ... (other imports: cn, Button, Command, etc.)
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
import { useDebounce } from "@/hooks/use-debounce";

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
}

interface AdvancedSelectProps {
  control: any;
  name: string;
  errors: any;
  useQueryHook: (params: { search: string }) => {
    data: any[] | undefined;
    isLoading: boolean;
    refetch: () => void;
  };
  itemValueKey: string;
  itemLabelKey: string;
  label?: string;
  selectPlaceholder: string;
  searchPlaceholder: string;
  emptyStateText: string;
  popoverContentClassName?: string;

  // --- NEW & UPDATED PROPS ---
  NewItemModal?: React.ComponentType<NewItemModalProps>;
  newItemPageUrl?: string; // URL for creating a new item in a new tab
  disabledItemValues?: (string | number)[]; // Array of values to disable
}

export const AdvancedSelect: React.FC<AdvancedSelectProps> = ({
  // ... (destructure all props)
  control,
  name,
  errors,
  label,
  useQueryHook,
  itemValueKey,
  itemLabelKey,
  selectPlaceholder,
  searchPlaceholder,
  emptyStateText,
  NewItemModal,
  newItemPageUrl,
  disabledItemValues,
  popoverContentClassName = "w-[270px]",
}) => {
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: items,
    isLoading,
    refetch,
  } = useQueryHook({ search: debouncedSearchQuery });

  const handleCreateNew = () => {
    setOpen(false);
    if (newItemPageUrl) {
      window.open(newItemPageUrl, "_blank", "noopener,noreferrer");
    } else if (NewItemModal) {
      setIsModalOpen(true);
    }
  };

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
                    "w-full justify-between h-8 text-xs", // Adjusted style from your example
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value
                    ? items?.find(
                        (item) => item[itemValueKey] === field.value
                      )?.[itemLabelKey]
                    : selectPlaceholder}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn("p-0", popoverContentClassName)}>
                <Command>
                  <CommandInput
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="flex flex-col gap-2 items-center p-2 text-center">
                        <p>{emptyStateText}</p>
                        {(NewItemModal || newItemPageUrl) && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCreateNew}
                          >
                            Create New
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {isLoading ? (
                        <div className="py-2 px-3 text-sm text-muted-foreground">
                          Loading...
                        </div>
                      ) : (
                        items?.map((item) => (
                          <CommandItem
                            key={item[itemValueKey]}
                            value={item[itemValueKey]}
                            onSelect={() => {
                              field.onChange(item[itemValueKey]);
                              setOpen(false);
                            }}
                            // --- NEW DISABLED LOGIC ---
                            disabled={
                              disabledItemValues?.includes(
                                item[itemValueKey]
                              ) && item[itemValueKey] !== field.value
                            }
                          >
                            {item[itemLabelKey]}
                            <Check
                              className={cn(
                                "ml-auto",
                                item[itemValueKey] === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Modal logic remains unchanged */}
            {NewItemModal && (
              <NewItemModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={(newItem) => {
                  field.onChange(newItem[itemValueKey]);
                  refetch();
                  setIsModalOpen(false);
                }}
              />
            )}

            {/* Error display needs to handle nested fields */}
            {errors.items?.[parseInt(name.split(".")[1])]?.productId && (
              <p className="text-red-500 text-xs">
                {errors.items[parseInt(name.split(".")[1])].productId.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
};
