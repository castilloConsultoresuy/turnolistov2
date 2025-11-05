import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider } from
"react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import { HomePage } from '@/pages/HomePage';
import { TicketPage } from "@/pages/TicketPage";
import { DisplayPage } from '@/pages/DisplayPage';
import { AdminPage } from '@/pages/AdminPage';
import { Toaster } from '@/components/ui/sonner';
const router = createBrowserRouter([
{
  path: "/",
  element: <HomePage />,
  errorElement: <RouteErrorBoundary />
},
{
  path: "/ticket/:ticketId",
  element: <TicketPage />,
  errorElement: <RouteErrorBoundary />
},
{
  path: "/display",
  element: <DisplayPage />,
  errorElement: <RouteErrorBoundary />
},
{
  path: "/admin",
  element: <AdminPage />,
  errorElement: <RouteErrorBoundary />
}]
);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </ErrorBoundary>
  </StrictMode>
);