"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next";
import { Toaster } from "react-hot-toast";

type Props = {
  children?: React.ReactNode;
};

export const ClientProvider = ({ children }: Props) => {
  const queryClient = new QueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <Toaster toastOptions={{ duration: 7000 }} />
          {children}
        </NuqsAdapter>
      </QueryClientProvider>
    </SessionProvider>
  );
};
