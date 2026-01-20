import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SubscriptionGuard } from "@/components/auth/SubscriptionGuard";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Loader2 } from "lucide-react";

// Eagerly loaded pages (critical path)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Lazy loaded pages - Dashboard
const Install = lazy(() => import("./pages/Install"));
const Billing = lazy(() => import("./pages/Billing"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const Medicines = lazy(() => import("./pages/dashboard/Medicines"));
const Batches = lazy(() => import("./pages/dashboard/Batches"));
const Sales = lazy(() => import("./pages/dashboard/Sales"));
const Suppliers = lazy(() => import("./pages/dashboard/Suppliers"));
const SupplierList = lazy(() => import("./pages/dashboard/suppliers/SupplierList"));
const StockShortList = lazy(() => import("./pages/dashboard/suppliers/StockShortList"));
const PendingOrders = lazy(() => import("./pages/dashboard/suppliers/PendingOrders"));
const OrderedOrders = lazy(() => import("./pages/dashboard/suppliers/OrderedOrders"));
const ReceivedOrders = lazy(() => import("./pages/dashboard/suppliers/ReceivedOrders"));
const DailyCash = lazy(() => import("./pages/dashboard/DailyCash"));
const Manufacturers = lazy(() => import("./pages/dashboard/Manufacturers"));
const Reports = lazy(() => import("./pages/dashboard/Reports"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const CustomerDues = lazy(() => import("./pages/dashboard/CustomerDues"));
const ExpiryMonitoring = lazy(() => import("./pages/dashboard/ExpiryMonitoring"));
const Alerts = lazy(() => import("./pages/dashboard/Alerts"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Lazy loaded pages - Owner Panel
const OwnerLayout = lazy(() => import("./pages/owner/OwnerLayout"));
const OwnerDashboard = lazy(() => import("./pages/owner/OwnerDashboard"));
const ClientManagement = lazy(() => import("./pages/owner/ClientManagement"));
const SubscriptionManagement = lazy(() => import("./pages/owner/SubscriptionManagement"));
const PaymentManagement = lazy(() => import("./pages/owner/PaymentManagement"));
const PaymentRequests = lazy(() => import("./pages/owner/PaymentRequests"));
const PricingPlans = lazy(() => import("./pages/owner/PricingPlans"));
const FeatureFlags = lazy(() => import("./pages/owner/FeatureFlags"));
const SystemReview = lazy(() => import("./pages/owner/SystemReview"));
const CMSManager = lazy(() => import("./pages/owner/CMSManager"));
const AuditLogs = lazy(() => import("./pages/owner/AuditLogs"));
const OwnerSettings = lazy(() => import("./pages/owner/OwnerSettings"));
const EmailTemplates = lazy(() => import("./pages/owner/EmailTemplates"));
const GlobalManufacturers = lazy(() => import("./pages/owner/GlobalManufacturers"));
const GlobalMedicines = lazy(() => import("./pages/owner/GlobalMedicines"));
const NotificationLogs = lazy(() => import("./pages/owner/NotificationLogs"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/install" element={<Install />} />
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
                    <Route path="payment-requests" element={<PaymentRequests />} />
                    <Route path="payments" element={<PaymentManagement />} />
                    <Route path="pricing" element={<PricingPlans />} />
                    <Route path="global-manufacturers" element={<GlobalManufacturers />} />
                    <Route path="global-medicines" element={<GlobalMedicines />} />
                    <Route path="feature-flags" element={<FeatureFlags />} />
                    <Route path="system-review" element={<SystemReview />} />
                    <Route path="cms" element={<CMSManager />} />
                    <Route path="email-templates" element={<EmailTemplates />} />
                    <Route path="notification-logs" element={<NotificationLogs />} />
                    <Route path="logs" element={<AuditLogs />} />
                    <Route path="settings" element={<OwnerSettings />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
