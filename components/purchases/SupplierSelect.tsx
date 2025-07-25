"use client";

import React, { useCallback, useMemo } from "react";
import { Control, FieldErrors, useFormContext } from "react-hook-form";

import api from "@/apis";
import NewSupplierModal from "../suppliers/new-supplier-modal";
import { SimpleSelect } from "../SimpleSelect";
import { useGlobalModal } from "@/store/useGlobalModal";
import { Button } from "@/components/ui/button";

interface SupplierSelectProps {
  name: string;
}

const SupplierSelect: React.FC<SupplierSelectProps> = ({
  name,
}) => {
  const { setValue } = useFormContext();
  const { openModal, closeModal } = useGlobalModal();

  const { data: suppliers, isLoading } = api.Supplier.GetAll.useQuery();

  const options = useMemo(() => {
    return (
      suppliers?.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      })) || []
    );
  }, [suppliers]);

  const handleNewSupplierSuccess = useCallback(
    (newSupplier: any) => {
      setValue(name, newSupplier.id);
      closeModal();
    },
    [setValue, name, closeModal]
  );

  const handleCreateNew = () => {
    openModal({
      title: "Create New Supplier",
      content: <NewSupplierModal onSuccess={handleNewSupplierSuccess} />,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <SimpleSelect
        name={name}
        label="Supplier"
        placeholder="Select supplier"
        searchPlaceholder="Search suppliers..."
        emptyStateText="No supplier found."
        options={options}
        isLoading={isLoading}
      />
      <Button type="button" variant="outline" onClick={handleCreateNew}>
        Add New Supplier
      </Button>
    </div>
  );
};

export default SupplierSelect;
