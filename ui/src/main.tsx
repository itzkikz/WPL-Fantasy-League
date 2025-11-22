import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRouter, Navigate, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { injectSpeedInsights } from '@vercel/speed-insights';
import { Analytics } from "@vercel/analytics/react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const router = createRouter({
  routeTree,
  notFoundMode: "root",
  defaultNotFoundComponent: () => <Navigate to="/404" replace />,
});

// Register types for full TypeScript support
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

injectSpeedInsights();


const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
      <Analytics />
    </StrictMode>
  );
}
