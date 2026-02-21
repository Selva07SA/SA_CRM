import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import { SystemAdminRoute } from "@/app/SystemAdminRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { EmployeesPage } from "@/features/employees/pages/EmployeesPage";
import { LeadsPage } from "@/features/leads/pages/LeadsPage";
import { ClientsPage } from "@/features/clients/pages/ClientsPage";
import { ClientDetailPage } from "@/features/clients/pages/ClientDetailPage";
import { SubscriptionsPage } from "@/features/subscriptions/pages/SubscriptionsPage";
import { InvoicesPage } from "@/features/invoices/pages/InvoicesPage";
import { PlansPage } from "@/features/plans/pages/PlansPage";
import { NotFoundPage } from "@/features/auth/pages/NotFoundPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/employees", element: <EmployeesPage /> },
          { path: "/leads", element: <LeadsPage /> },
          { path: "/clients", element: <ClientsPage /> },
          { path: "/clients/:id", element: <ClientDetailPage /> },
          { path: "/subscriptions", element: <SubscriptionsPage /> },
          { path: "/invoices", element: <InvoicesPage /> },
          {
            element: <SystemAdminRoute />,
            children: [{ path: "/plans", element: <PlansPage /> }]
          }
        ]
      }
    ]
  },
  { path: "*", element: <NotFoundPage /> }
]);
