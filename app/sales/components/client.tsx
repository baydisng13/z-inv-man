
"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { Sale } from "@/schemas/sale-schema";
import { columns } from "./columns";

interface SalesClientProps {
  data: Sale[];
}

export const SalesClient: React.FC<SalesClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Sales (${data.length})`}
          description="Manage sales for your store"
        />
        <Button onClick={() => router.push(`/app/pos`)}>
          <Plus className="mr-2 h-4 w-4" /> New Sale
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
};
