"use client";

import React, { useCallback, useMemo } from "react";
import { Control, FieldErrors, useFormContext } from "react-hook-form";

import api from "@/apis";

import { useGlobalModal } from "@/store/useGlobalModal";
import { Button } from "@/components/ui/button";
import { SimpleSelect } from "@/components/SimpleSelect";
import NewCustomerModal from "@/components/customers/new-customer-modal";

interface CustomerSelectProps {
  name: string;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({
  name,
}) => {
  const { setValue } = useFormContext();
  const { openModal, closeModal } = useGlobalModal();

  const { data: customers, isLoading } = api.Customer.GetAll.useQuery();

  const options = useMemo(() => {
    return (
      customers?.map((customer) => ({
        label: customer.name,
        value: customer.id,
      })) || []
    );
  }, [customers]);

  const handleNewCustomerSuccess = useCallback(
    (newCustomer: any) => {
      setValue(name, newCustomer.id);
      closeModal();
    },
    [setValue, name, closeModal]
  );

  const handleCreateNew = () => {
    openModal({
      title: "Create New Customer",
      content: <NewCustomerModal onSuccess={handleNewCustomerSuccess} />,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <SimpleSelect
        name={name}
        label="Customer"
        placeholder="Select customer"
        searchPlaceholder="Search customers..."
        emptyStateText="No customer found."
        options={options}
        isLoading={isLoading}
      />
      <Button type="button" variant="outline" onClick={handleCreateNew}>
        Add New Customer
      </Button>
    </div>
  );
};

export default CustomerSelect;
