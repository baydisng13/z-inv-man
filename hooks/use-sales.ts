import { createContext, useContext } from "react";
import { SalesType } from "@/schemas/sales-schema";

interface SalesContextType {
  sales: SalesType[];
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider = ({ children, sales }: {
  children: React.ReactNode;
  sales: SalesType[];
}) => {
  return (
    <SalesContext.Provider value={{ sales }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error("useSales must be used within a SalesProvider");
  }
  return context;
};
