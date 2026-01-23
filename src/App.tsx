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
import { BrandedLoader } from "@/components/ui/branded-loader";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PrefetchProvider } from "@/components/PrefetchProvider";

// Eagerly loaded pages (critical path)
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

// Lazy loaded pages - Dashboard
const Install = lazy(() => import("./pages/Install"));
const Billing = lazy(() => import("./pages/Billing"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const Medicines = lazy(() => import("./pages/dashboard/Medicines"));
const Batches = lazy(() => import("./pages/dashboard/Batches"));
const Sales = lazy(() => import("./pages/dashboard/Sales"));
const Suppliers = lazy(() => import("./pages/dashboard/Suppliers"));
const SupplierList = lazy(() => import("./pages/dashboard/suppliers/SupplierList"));
const SupplierDetails = lazy(() => import("./pages/dashboard/suppliers/SupplierDetails"));
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
const MedicineReference = lazy(() => import("./pages/dashboard/MedicineReference"));
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
const MedicineReferenceManagement = lazy(() => import("./pages/owner/MedicineReferenceManagement"));
const NotificationLogs = lazy(() => import("./pages/owner/NotificationLogs"));
const LockedAccounts = lazy(() => import("./pages/owner/LockedAccounts"));

// Owner Settings Sub-pages
const BrandingSettings = lazy(() => import("./pages/owner/settings/BrandingSettings"));
const SupportContactSettings = lazy(() => import("./pages/owner/settings/SupportContactSettings"));
const AdminTeamSettings = lazy(() => import("./pages/owner/settings/AdminTeamSettings"));
const SmtpSettings = lazy(() => import("./pages/owner/settings/SmtpSettings"));
const SmsGatewaySettings = lazy(() => import("./pages/owner/settings/SmsGatewaySettings"));
const NotificationSettings = lazy(() => import("./pages/owner/settings/NotificationSettings"));
const SecurityAlertSettings = lazy(() => import("./pages/owner/settings/SecurityAlertSettings"));
const PaymentGatewaySettings = lazy(() => import("./pages/owner/settings/PaymentGatewaySettings"));
const SystemSettings = lazy(() => import("./pages/owner/settings/SystemSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh longer
      gcTime: 1000 * 60 * 15,   // 15 minutes - garbage collect old cache
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: false, // Don't refetch on reconnect 
      refetchOnMount: false, // Don't refetch if data is fresh
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => <BrandedLoader />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <PrefetchProvider>
            <AuthProvider>
              <LanguageProvider>
                <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
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
                      <Route path=":id" element={<SupplierDetails />} />
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
                    <Route path="medicine-info" element={<MedicineReference />} />
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
                    <Route path="medicine-reference" element={<MedicineReferenceManagement />} />
                    <Route path="locked-accounts" element={<LockedAccounts />} />
                    <Route path="feature-flags" element={<FeatureFlags />} />
                    <Route path="system-review" element={<SystemReview />} />
                    <Route path="cms" element={<CMSManager />} />
                    <Route path="email-templates" element={<EmailTemplates />} />
                    <Route path="notification-logs" element={<NotificationLogs />} />
                    <Route path="logs" element={<AuditLogs />} />
                    <Route path="settings" element={<OwnerSettings />} />
                    <Route path="settings/branding" element={<BrandingSettings />} />
                    <Route path="settings/support" element={<SupportContactSettings />} />
                    <Route path="settings/admin-team" element={<AdminTeamSettings />} />
                    <Route path="settings/smtp" element={<SmtpSettings />} />
                    <Route path="settings/sms" element={<SmsGatewaySettings />} />
                    <Route path="settings/notifications" element={<NotificationSettings />} />
                    <Route path="settings/security" element={<SecurityAlertSettings />} />
                    <Route path="settings/payment" element={<PaymentGatewaySettings />} />
                    <Route path="settings/system" element={<SystemSettings />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </LanguageProvider>
          </AuthProvider>
        </PrefetchProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
