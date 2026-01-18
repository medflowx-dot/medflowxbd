import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { ReportDateRange } from './useReports';

export interface SupplierPurchaseItem {
  id: string;
  purchase_date: string;
  invoice_number: string | null;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  notes: string | null;
}

export interface SupplierPaymentItem {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
}

export interface IndividualSupplierReport {
  supplier: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    contact_person: string | null;
    total_due: number;
    total_paid: number;
  };
  purchases: SupplierPurchaseItem[];
  payments: SupplierPaymentItem[];
  summary: {
    totalPurchases: number;
    totalPayments: number;
    currentDue: number;
    purchaseCount: number;
    paymentCount: number;
  };
}

export interface SupplierSummaryItem {
  id: string;
  name: string;
  phone: string | null;
  purchaseAmount: number;
  paidAmount: number;
  dueAmount: number;
  purchaseCount: number;
  paymentCount: number;
}

export interface AllSuppliersReport {
  suppliers: SupplierSummaryItem[];
  summary: {
    totalPurchases: number;
    totalPayments: number;
    totalDue: number;
    supplierCount: number;
  };
}

export function useIndividualSupplierReport(supplierId: string | null, dateRange: ReportDateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['individual-supplier-report', supplierId, dateRange.start, dateRange.end],
    queryFn: async (): Promise<IndividualSupplierReport | null> => {
      if (!supplierId) return null;

      // Fetch supplier details
      const { data: supplier, error: supplierError } = await supabase
        .from('suppliers')
        .select('id, name, phone, address, contact_person, total_due, total_paid')
        .eq('id', supplierId)
        .single();

      if (supplierError) throw supplierError;

      // Format dates for query
      const startDate = dateRange.start.toISOString().split('T')[0];
      const endDate = dateRange.end.toISOString().split('T')[0];

      // Fetch purchases in date range
      const { data: purchases, error: purchasesError } = await supabase
        .from('supplier_purchases')
        .select('id, purchase_date, invoice_number, total_amount, paid_amount, due_amount, notes')
        .eq('supplier_id', supplierId)
        .gte('purchase_date', startDate)
        .lte('purchase_date', endDate)
        .order('purchase_date', { ascending: false });

      if (purchasesError) throw purchasesError;

      // Fetch payments in date range
      const { data: payments, error: paymentsError } = await supabase
        .from('supplier_payments')
        .select('id, payment_date, amount, payment_method, reference_number, notes')
        .eq('supplier_id', supplierId)
        .gte('payment_date', startDate)
        .lte('payment_date', endDate)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Calculate summary for selected period
      const totalPurchases = purchases?.reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;
      const totalPayments = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        supplier,
        purchases: purchases || [],
        payments: payments || [],
        summary: {
          totalPurchases,
          totalPayments,
          currentDue: supplier.total_due,
          purchaseCount: purchases?.length || 0,
          paymentCount: payments?.length || 0,
        },
      };
    },
    enabled: !!user && !!supplierId,
  });
}

export function useAllSuppliersReport(dateRange: ReportDateRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-suppliers-report', dateRange.start, dateRange.end],
    queryFn: async (): Promise<AllSuppliersReport> => {
      // Format dates for query
      const startDate = dateRange.start.toISOString().split('T')[0];
      const endDate = dateRange.end.toISOString().split('T')[0];

      // Fetch all suppliers
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name, phone, total_due, total_paid')
        .eq('is_active', true)
        .order('name');

      if (suppliersError) throw suppliersError;

      // Fetch all purchases in date range
      const { data: purchases, error: purchasesError } = await supabase
        .from('supplier_purchases')
        .select('supplier_id, total_amount, paid_amount')
        .gte('purchase_date', startDate)
        .lte('purchase_date', endDate);

      if (purchasesError) throw purchasesError;

      // Fetch all payments in date range
      const { data: payments, error: paymentsError } = await supabase
        .from('supplier_payments')
        .select('supplier_id, amount')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);

      if (paymentsError) throw paymentsError;

      // Group purchases and payments by supplier
      const purchasesBySupplier = new Map<string, { amount: number; count: number }>();
      purchases?.forEach((p) => {
        const existing = purchasesBySupplier.get(p.supplier_id) || { amount: 0, count: 0 };
        purchasesBySupplier.set(p.supplier_id, {
          amount: existing.amount + Number(p.total_amount),
          count: existing.count + 1,
        });
      });

      const paymentsBySupplier = new Map<string, { amount: number; count: number }>();
      payments?.forEach((p) => {
        const existing = paymentsBySupplier.get(p.supplier_id) || { amount: 0, count: 0 };
        paymentsBySupplier.set(p.supplier_id, {
          amount: existing.amount + Number(p.amount),
          count: existing.count + 1,
        });
      });

      // Build supplier summaries
      const supplierSummaries: SupplierSummaryItem[] = suppliers?.map((s) => {
        const purchaseData = purchasesBySupplier.get(s.id) || { amount: 0, count: 0 };
        const paymentData = paymentsBySupplier.get(s.id) || { amount: 0, count: 0 };

        return {
          id: s.id,
          name: s.name,
          phone: s.phone,
          purchaseAmount: purchaseData.amount,
          paidAmount: paymentData.amount,
          dueAmount: s.total_due,
          purchaseCount: purchaseData.count,
          paymentCount: paymentData.count,
        };
      }) || [];

      // Calculate totals
      const totalPurchases = supplierSummaries.reduce((sum, s) => sum + s.purchaseAmount, 0);
      const totalPayments = supplierSummaries.reduce((sum, s) => sum + s.paidAmount, 0);
      const totalDue = supplierSummaries.reduce((sum, s) => sum + s.dueAmount, 0);

      return {
        suppliers: supplierSummaries,
        summary: {
          totalPurchases,
          totalPayments,
          totalDue,
          supplierCount: suppliers?.length || 0,
        },
      };
    },
    enabled: !!user,
  });
}

export function useSuppliersList() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['suppliers-list-for-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name, phone')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
