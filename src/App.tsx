import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Billing from "./pages/Billing";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Medicines from "./pages/dashboard/Medicines";
import Batches from "./pages/dashboard/Batches";
import Sales from "./pages/dashboard/Sales";
import Suppliers from "./pages/dashboard/Suppliers";
import SupplierList from "./pages/dashboard/suppliers/SupplierList";
import StockShortList from "./pages/dashboard/suppliers/StockShortList";
import PendingOrders from "./pages/dashboard/suppliers/PendingOrders";
import OrderedOrders from "./pages/dashboard/suppliers/OrderedOrders";
import ReceivedOrders from "./pages/dashboard/suppliers/ReceivedOrders";
import DailyCash from "./pages/dashboard/DailyCash";
import Manufacturers from "./pages/dashboard/Manufacturers";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import CustomerDues from "./pages/dashboard/CustomerDues";
import ExpiryMonitoring from "./pages/dashboard/ExpiryMonitoring";
import Alerts from "./pages/dashboard/Alerts";
import NotFound from "./pages/NotFound";

// Owner Panel Pages
import OwnerLayout from "./pages/owner/OwnerLayout";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import ClientManagement from "./pages/owner/ClientManagement";
import SubscriptionManagement from "./pages/owner/SubscriptionManagement";
import PaymentManagement from "./pages/owner/PaymentManagement";
import PricingPlans from "./pages/owner/PricingPlans";
import FeatureFlags from "./pages/owner/FeatureFlags";
import SystemReview from "./pages/owner/SystemReview";
import CMSManager from "./pages/owner/CMSManager";
import AuditLogs from "./pages/owner/AuditLogs";
import OwnerSettings from "./pages/owner/OwnerSettings";
import EmailTemplates from "./pages/owner/EmailTemplates";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/billing" element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } />
            
            {/* Client Dashboard - Protected by Auth + Subscription */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                    <DashboardLayout />
                  </SubscriptionGuard>
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="medicines" element={<Medicines />} />
              <Route path="batches" element={<Batches />} />
              <Route path="expiry" element={<ExpiryMonitoring />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="sales" element={<Sales />} />
              <Route path="customer-dues" element={<CustomerDues />} />
              {/* Admin-only routes - staff will be redirected */}
              <Route path="suppliers" element={<AdminRoute><Suppliers /></AdminRoute>}>
                <Route index element={<SupplierList />} />
                <Route path="stock-short" element={<StockShortList />} />
                <Route path="pending" element={<PendingOrders />} />
                <Route path="ordered" element={<OrderedOrders />} />
                <Route path="received" element={<ReceivedOrders />} />
              </Route>
              <Route path="manufacturers" element={<AdminRoute><Manufacturers /></AdminRoute>} />
              <Route path="reports" element={<AdminRoute><Reports /></AdminRoute>} />
              <Route path="settings" element={<AdminRoute><Settings /></AdminRoute>} />
              <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              {/* Staff-accessible routes */}
              <Route path="daily-cash" element={<DailyCash />} />
            </Route>

            {/* Owner Panel - No subscription check (owner bypasses) */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute>
                  <OwnerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OwnerDashboard />} />
              <Route path="clients" element={<ClientManagement />} />
              <Route path="subscriptions" element={<SubscriptionManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route path="pricing" element={<PricingPlans />} />
              <Route path="feature-flags" element={<FeatureFlags />} />
              <Route path="system-review" element={<SystemReview />} />
              <Route path="cms" element={<CMSManager />} />
              <Route path="email-templates" element={<EmailTemplates />} />
              <Route path="logs" element={<AuditLogs />} />
              <Route path="settings" element={<OwnerSettings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
