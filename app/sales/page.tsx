
import { SalesProvider } from "@/hooks/use-sales";
import { SalesClient } from "./components/client";
import { columns } from "./components/columns";
import { getAllSales } from "@/apis/sales";

async function getSales() {
  const sales = await getAllSales();
  return sales;
}

export default async function SalesPage() {
  const data = await getSales();

  return (
    <SalesProvider>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SalesClient data={data} columns={columns} />
      </div>
    </SalesProvider>
  );
}
