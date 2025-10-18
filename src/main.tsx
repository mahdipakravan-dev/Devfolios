import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SidebarProvider } from "@/Components/ui/sidebar.tsx";
import {
  QueryClientProvider,
  QueryClient,
  type DefaultOptions,
} from "@tanstack/react-query";

const defaultOptions: DefaultOptions = {
  queries: {
    gcTime: 10 * 60 * 1000, // inactive time for query's garbage collection
    staleTime: 10 * 60 * 1000, // time until query uses data from cache
    refetchOnWindowFocus: false, // Whenever window comes in focus it won't refetch the data
    refetchOnReconnect: true, // refetches on reconnection
    retry: 2,
  },
};
const queryClient = new QueryClient({ defaultOptions });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </QueryClientProvider>
  </StrictMode>
);
