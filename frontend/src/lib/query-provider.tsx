"use client";

import {
  QueryClientProvider,
  type QueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

import { getQueryClient } from "@/lib/query-client";

type QueryProviderProps = {
  children: ReactNode;
  client?: QueryClient;
};

export function QueryProvider({ children, client }: QueryProviderProps) {
  const queryClient = client ?? getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      ) : null}
    </QueryClientProvider>
  );
}