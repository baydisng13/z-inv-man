"use client";

import queryClient from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./ui/sonner";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { GlobalModal } from "./GlobalModal";
import ConfirmationDialog from "./confirmation-dialog";

function Provider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider {...props}>
        <>
          {children}

          <GlobalModal />
          <ConfirmationDialog />
          <Toaster />
        </>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}

export default Provider;
