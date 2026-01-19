import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { DailySummaryReport, SalesReportItem, SupplierDueItem } from '@/hooks/useReports';
import type { DailyCashSummary } from '@/hooks/useDailyCash';

// Use "Tk" for PDF as jsPDF doesn't support Bengali characters (৳)
const CURRENCY = 'Tk ';
const CURRENCY_LABEL = 'BDT (Taka)';

export interface CustomerDueItem {
  id: string;
  name: string;
  phone: string | null;
  total_due: number;
}

export interface DailyTransaction {
  id: string;
  type: 'sale' | 'collection' | 'supplier_payment' | 'cost';
  description: string;
  amount: number;
  payment_method: string;
  time: string;
}

function addHeader(doc: jsPDF, title: string, dateRange?: { start: Date; end: Date }) {
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MedFlowx', 14, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 30);
  
  // Date range
  if (dateRange) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `Period: ${format(dateRange.start, 'MMM dd, yyyy')} - ${format(dateRange.end, 'MMM dd, yyyy')}`,
      14,
      38
    );
  }
  
  // Currency info
  doc.setFontSize(8);
  doc.text(`Currency: ${CURRENCY_LABEL} (${CURRENCY})`, 14, dateRange ? 44 : 38);
  
  // Generated date
  doc.text(`Generated: ${format(new Date(), 'PPP p')}`, 100, dateRange ? 44 : 38);
  doc.setTextColor(0);
  
  return dateRange ? 52 : 46; // Return Y position for content to start
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
}

export function generateDailySummaryPDF(
  data: DailySummaryReport[],
  dateRange: { start: Date; end: Date }
) {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Daily Summary Report', dateRange);

  // Calculate totals
  const totals = data.reduce(
    (acc, row) => ({
      totalSales: acc.totalSales + row.totalSales,
      totalPaid: acc.totalPaid + row.totalPaid,
      totalDue: acc.totalDue + row.totalDue,
      salesCount: acc.salesCount + row.salesCount,
      dueCollected: acc.dueCollected + row.dueCollected,
      supplierPayments: acc.supplierPayments + row.supplierPayments,
      dailyCosts: acc.dailyCosts + row.dailyCosts,
      netCashFlow: acc.netCashFlow + row.netCashFlow,
    }),
    {
      totalSales: 0,
      totalPaid: 0,
      totalDue: 0,
      salesCount: 0,
      dueCollected: 0,
      supplierPayments: 0,
      dailyCosts: 0,
      netCashFlow: 0,
    }
  );

  // Summary cards
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summaryY = startY + 6;
  doc.text(`Total Sales: ${CURRENCY}${totals.totalSales.toLocaleString()}`, 14, summaryY);
  doc.text(`Total Paid: ${CURRENCY}${totals.totalPaid.toLocaleString()}`, 70, summaryY);
  doc.text(`Total Due: ${CURRENCY}${totals.totalDue.toLocaleString()}`, 126, summaryY);
  doc.text(`Net Cash Flow: ${CURRENCY}${totals.netCashFlow.toLocaleString()}`, 14, summaryY + 5);

  // Table
  autoTable(doc, {
    startY: summaryY + 12,
    head: [['Date', 'Sales', 'Paid', 'Due', 'Due Collected', 'Supplier Pay', 'Costs', 'Net Flow']],
    body: data.map(row => [
      format(new Date(row.date), 'MMM dd, yyyy'),
      `${CURRENCY}${row.totalSales.toLocaleString()}`,
      `${CURRENCY}${row.totalPaid.toLocaleString()}`,
      `${CURRENCY}${row.totalDue.toLocaleString()}`,
      `${CURRENCY}${row.dueCollected.toLocaleString()}`,
      `${CURRENCY}${row.supplierPayments.toLocaleString()}`,
      `${CURRENCY}${row.dailyCosts.toLocaleString()}`,
      `${CURRENCY}${row.netCashFlow.toLocaleString()}`,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  addFooter(doc);
  doc.save(`daily-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateSalesReportPDF(
  data: SalesReportItem[],
  dateRange: { start: Date; end: Date }
) {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Sales Report', dateRange);

  // Calculate totals
  const totals = data.reduce(
    (acc, row) => ({
      total: acc.total + row.total_amount,
      paid: acc.paid + row.paid_amount,
      due: acc.due + row.due_amount,
    }),
    { total: 0, paid: 0, due: 0 }
  );

  // Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summaryY = startY + 6;
  doc.text(`Total Sales: ${CURRENCY}${totals.total.toLocaleString()}`, 14, summaryY);
  doc.text(`Total Paid: ${CURRENCY}${totals.paid.toLocaleString()}`, 70, summaryY);
  doc.text(`Unpaid Balance: ${CURRENCY}${totals.due.toLocaleString()}`, 126, summaryY);
  doc.text(`Number of Entries: ${data.length}`, 14, summaryY + 5);

  // Table
  autoTable(doc, {
    startY: summaryY + 12,
    head: [['Entry ID', 'Type', 'Date', 'Total', 'Paid', 'Due', 'Method']],
    body: data.map(row => [
      row.invoice_number,
      row.entry_type === 'quick' ? 'Quick' : 'Detailed',
      format(new Date(row.sale_date), 'MMM dd, yyyy'),
      `${CURRENCY}${row.total_amount.toLocaleString()}`,
      `${CURRENCY}${row.paid_amount.toLocaleString()}`,
      row.due_amount > 0 ? `${CURRENCY}${row.due_amount.toLocaleString()}` : '-',
      row.payment_method,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  addFooter(doc);
  doc.save(`sales-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateSupplierDuePDF(data: SupplierDueItem[]) {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Supplier Due Report');

  // Calculate totals
  const totalDue = data.reduce((acc, row) => acc + row.total_due, 0);
  const totalPaid = data.reduce((acc, row) => acc + row.total_paid, 0);

  // Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total Outstanding: ${CURRENCY}${totalDue.toLocaleString()}`, 14, startY + 6);
  doc.text(`Total Paid (All Time): ${CURRENCY}${totalPaid.toLocaleString()}`, 80, startY + 6);
  doc.text(`Number of Suppliers: ${data.length}`, 14, startY + 11);

  // Table
  autoTable(doc, {
    startY: startY + 18,
    head: [['Supplier Name', 'Phone', 'Total Due', 'Total Paid', 'Last Purchase']],
    body: data.map(row => [
      row.name,
      row.phone || '-',
      `${CURRENCY}${row.total_due.toLocaleString()}`,
      `${CURRENCY}${row.total_paid.toLocaleString()}`,
      row.last_purchase_date ? format(new Date(row.last_purchase_date), 'MMM dd, yyyy') : '-',
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 158, 11] },
  });

  addFooter(doc);
  doc.save(`supplier-due-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export interface IndividualCustomerReportData {
  customer: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    total_due: number;
  };
  payments: {
    id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    notes: string | null;
  }[];
  summary: {
    totalPayments: number;
    paymentCount: number;
  };
}

export function generateIndividualCustomerPDF(
  data: IndividualCustomerReportData,
  dateRange: { start: Date; end: Date }
) {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Customer Transaction Report', dateRange);

  // Customer Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Details', 14, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${data.customer.name}`, 14, startY + 8);
  doc.text(`Phone: ${data.customer.phone || '-'}`, 14, startY + 14);
  doc.text(`Address: ${data.customer.address || '-'}`, 14, startY + 20);

  // Summary Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, startY + 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total Payments (Period): ${CURRENCY}${data.summary.totalPayments.toLocaleString()}`, 14, startY + 40);
  doc.text(`Payment Count: ${data.summary.paymentCount}`, 100, startY + 40);
  doc.text(`Current Outstanding: ${CURRENCY}${data.customer.total_due.toLocaleString()}`, 14, startY + 48);

  // Payment History Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment History', 14, startY + 60);

  if (data.payments.length > 0) {
    autoTable(doc, {
      startY: startY + 66,
      head: [['#', 'Date', 'Amount', 'Method', 'Notes']],
      body: data.payments.map((payment, index) => [
        (index + 1).toString(),
        format(new Date(payment.payment_date), 'MMM dd, yyyy'),
        `${CURRENCY}${payment.amount.toLocaleString()}`,
        payment.payment_method || 'Cash',
        payment.notes || '-',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [52, 211, 153] },
      columnStyles: {
        0: { cellWidth: 12 },
        2: { halign: 'right' },
      },
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('No payments in selected period', 14, startY + 66);
  }

  addFooter(doc);
  doc.save(`customer-report-${data.customer.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateCustomerDuesPDF(data: CustomerDueItem[]) {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Customer Dues Report');

  // Calculate totals
  const totalDue = data.reduce((acc, row) => acc + row.total_due, 0);

  // Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Total Outstanding: ${CURRENCY}${totalDue.toLocaleString()}`, 14, startY + 6);
  doc.text(`Number of Customers: ${data.length}`, 80, startY + 6);

  // Table
  autoTable(doc, {
    startY: startY + 14,
    head: [['#', 'Customer Name', 'Phone', 'Total Due']],
    body: data.map((row, index) => [
      (index + 1).toString(),
      row.name,
      row.phone || '-',
      `${CURRENCY}${row.total_due.toLocaleString()}`,
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [245, 158, 11] },
    columnStyles: {
      0: { cellWidth: 15 },
      3: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Footer with total
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Grand Total: ${CURRENCY}${totalDue.toLocaleString()}`, 14, finalY + 10);

  addFooter(doc);
  doc.save(`customer-dues-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateDailyClosingCashPDF(
  summary: DailyCashSummary,
  transactions: DailyTransaction[],
  date: Date
) {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Daily Closing Cash Report');

  // Date
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Date: ${format(date, 'EEEE, MMMM dd, yyyy')}`, 14, startY);

  // Summary Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Cash Flow Summary', 14, startY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  const summaryStartY = startY + 16;
  
  // Opening Cash
  doc.text('Opening Cash:', 14, summaryStartY);
  doc.text(`${CURRENCY}${summary.openingCash.toLocaleString()}`, 80, summaryStartY);
  
  // Cash In Section
  doc.setFont('helvetica', 'bold');
  doc.text('Cash In:', 14, summaryStartY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Sales (Cash):`, 20, summaryStartY + 14);
  doc.text(`${CURRENCY}${summary.salesCashIn.toLocaleString()}`, 80, summaryStartY + 14);
  doc.text(`Due Collections:`, 20, summaryStartY + 20);
  doc.text(`${CURRENCY}${summary.dueCollected.toLocaleString()}`, 80, summaryStartY + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total In:`, 20, summaryStartY + 26);
  doc.text(`${CURRENCY}${summary.totalIn.toLocaleString()}`, 80, summaryStartY + 26);
  
  // Cash Out Section
  doc.setFont('helvetica', 'bold');
  doc.text('Cash Out:', 14, summaryStartY + 36);
  doc.setFont('helvetica', 'normal');
  doc.text(`Supplier Payments:`, 20, summaryStartY + 42);
  doc.text(`${CURRENCY}${summary.supplierPayments.toLocaleString()}`, 80, summaryStartY + 42);
  doc.text(`Daily Costs:`, 20, summaryStartY + 48);
  doc.text(`${CURRENCY}${summary.dailyCosts.toLocaleString()}`, 80, summaryStartY + 48);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Out:`, 20, summaryStartY + 54);
  doc.text(`${CURRENCY}${summary.totalOut.toLocaleString()}`, 80, summaryStartY + 54);
  
  // Closing Cash (highlighted)
  doc.setFillColor(240, 253, 244); // light green
  doc.rect(14, summaryStartY + 62, 100, 12, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CLOSING CASH:', 16, summaryStartY + 70);
  doc.text(`${CURRENCY}${summary.closingCash.toLocaleString()}`, 80, summaryStartY + 70);

  // Transactions Table
  const tableStartY = summaryStartY + 82;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details (Cash Only)', 14, tableStartY);

  if (transactions.length > 0) {
    autoTable(doc, {
      startY: tableStartY + 6,
      head: [['Time', 'Type', 'Description', 'In', 'Out']],
      body: transactions.map(tx => {
        const typeLabels: Record<string, string> = {
          sale: 'Sale',
          collection: 'Collection',
          supplier_payment: 'Supplier',
          cost: 'Cost',
        };
        const isIn = tx.type === 'sale' || tx.type === 'collection';
        return [
          tx.time,
          typeLabels[tx.type] || tx.type,
          tx.description,
          isIn ? `${CURRENCY}${tx.amount.toLocaleString()}` : '-',
          !isIn ? `${CURRENCY}${tx.amount.toLocaleString()}` : '-',
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
      },
    });

    // Footer totals
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Cash In: ${CURRENCY}${summary.totalIn.toLocaleString()}`, 14, finalY + 8);
    doc.text(`Total Cash Out: ${CURRENCY}${summary.totalOut.toLocaleString()}`, 80, finalY + 8);
    doc.text(`Net: ${CURRENCY}${(summary.totalIn - summary.totalOut).toLocaleString()}`, 146, finalY + 8);
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('No cash transactions for this date.', 14, tableStartY + 10);
  }

  addFooter(doc);
  doc.save(`daily-cash-${format(date, 'yyyy-MM-dd')}.pdf`);
}

// Order PDF Types and Generator
export interface OrderPDFData {
  order_number: string;
  order_date: string;
  supplier_name: string;
  supplier_phone: string | null;
  items: Array<{
    medicine_name: string;
    quantity: number;
    unit: string;
    is_tax_applicable?: boolean;
  }>;
  status: string;
}

export function generateOrderPDF(data: OrderPDFData, download: boolean = true): jsPDF {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Purchase Order');

  // Order Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order #: ${data.order_number}`, 14, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Date: ${format(new Date(data.order_date), 'dd MMMM yyyy')}`, 14, startY + 7);
  doc.text(`Status: ${data.status}`, 120, startY + 7);

  // Supplier Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Supplier Details', 14, startY + 18);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${data.supplier_name}`, 14, startY + 25);
  doc.text(`Phone: ${data.supplier_phone || '-'}`, 14, startY + 31);

  // Items Table
  autoTable(doc, {
    startY: startY + 40,
    head: [['#', 'Medicine Name', 'Quantity', 'Unit', 'Tax']],
    body: data.items.map((item, index) => [
      (index + 1).toString(),
      item.medicine_name,
      item.quantity.toString(),
      item.unit,
      item.is_tax_applicable ? 'Yes' : 'No',
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [20, 184, 166] }, // teal color
  });

  // Total items
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Items: ${data.items.length}`, 14, finalY + 10);

  addFooter(doc);
  
  if (download) {
    doc.save(`order-${data.order_number}.pdf`);
  }
  
  return doc;
}

export interface ExpiryReportItem {
  id: string;
  batch_number: string;
  expiry_date: string;
  medicine_name: string;
  manufacturer: string | null;
  category: string | null;
  daysUntilExpiry: number;
  status: string;
}

export function generateExpiryReportPDF(
  data: ExpiryReportItem[],
  filterLabel: string
) {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Expiry Monitoring Report');

  // Filter info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Filter: ${filterLabel}`, 14, startY);

  // Summary stats
  const expired = data.filter(d => d.status === 'expired').length;
  const critical = data.filter(d => d.status === 'critical').length;
  const warning = data.filter(d => d.status === 'warning').length;
  const caution = data.filter(d => d.status === 'caution').length;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const summaryY = startY + 8;
  doc.text(`Total Batches: ${data.length}`, 14, summaryY);
  doc.text(`Expired: ${expired}`, 60, summaryY);
  doc.text(`Critical (30d): ${critical}`, 100, summaryY);
  doc.text(`Warning (60d): ${warning}`, 145, summaryY);

  // Table
  if (data.length > 0) {
    autoTable(doc, {
      startY: summaryY + 8,
      head: [['Medicine', 'Batch No.', 'Category', 'Manufacturer', 'Expiry Date', 'Days Left', 'Status']],
      body: data.map(row => {
        let statusLabel = '';
        switch (row.status) {
          case 'expired': statusLabel = 'EXPIRED'; break;
          case 'critical': statusLabel = 'Critical'; break;
          case 'warning': statusLabel = 'Warning'; break;
          case 'caution': statusLabel = 'Caution'; break;
          default: statusLabel = 'Safe';
        }
        return [
          row.medicine_name,
          row.batch_number,
          row.category || '-',
          row.manufacturer || '-',
          format(new Date(row.expiry_date), 'MMM dd, yyyy'),
          row.daysUntilExpiry < 0 ? `${Math.abs(row.daysUntilExpiry)} ago` : `${row.daysUntilExpiry}`,
          statusLabel,
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [239, 68, 68] }, // Red color for expiry
      didParseCell: function(data) {
        // Color code status column
        if (data.column.index === 6 && data.section === 'body') {
          const status = data.row.raw?.[6];
          if (status === 'EXPIRED') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Critical') {
            data.cell.styles.textColor = [234, 88, 12];
          } else if (status === 'Warning') {
            data.cell.styles.textColor = [202, 138, 4];
          }
        }
      },
    });

    // Summary footer
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    if (expired > 0) {
      doc.setTextColor(220, 38, 38);
      doc.text(`! ${expired} batch(es) already expired - immediate action required`, 14, finalY + 10);
      doc.setTextColor(0);
    }
    
    if (critical > 0) {
      doc.text(`${critical} batch(es) expiring within 30 days`, 14, finalY + (expired > 0 ? 16 : 10));
    }
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('No batches found for the selected filter.', 14, summaryY + 10);
  }

  addFooter(doc);
  doc.save(`expiry-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// ============= Supplier Reports =============

export interface IndividualSupplierReportData {
  supplier: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    contact_person: string | null;
    total_due: number;
    total_paid: number;
  };
  purchases: {
    id: string;
    purchase_date: string;
    invoice_number: string | null;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
  }[];
  payments: {
    id: string;
    payment_date: string;
    amount: number;
    payment_method: string;
    reference_number: string | null;
  }[];
  summary: {
    totalPurchases: number;
    totalPayments: number;
    currentDue: number;
    purchaseCount: number;
    paymentCount: number;
  };
}

export interface AllSuppliersReportData {
  suppliers: {
    id: string;
    name: string;
    phone: string | null;
    purchaseAmount: number;
    paidAmount: number;
    dueAmount: number;
    purchaseCount: number;
    paymentCount: number;
  }[];
  summary: {
    totalPurchases: number;
    totalPayments: number;
    totalDue: number;
    supplierCount: number;
  };
}

export function generateIndividualSupplierPDF(
  data: IndividualSupplierReportData,
  dateRange: { start: Date; end: Date }
) {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Supplier Transaction Report', dateRange);

  // Supplier Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Supplier: ${data.supplier.name}`, 14, startY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  let infoY = startY + 6;
  if (data.supplier.phone) {
    doc.text(`Phone: ${data.supplier.phone}`, 14, infoY);
    infoY += 5;
  }
  if (data.supplier.address) {
    doc.text(`Address: ${data.supplier.address}`, 14, infoY);
    infoY += 5;
  }
  if (data.supplier.contact_person) {
    doc.text(`Contact: ${data.supplier.contact_person}`, 14, infoY);
    infoY += 5;
  }

  // Summary Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, infoY + 4);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summaryY = infoY + 10;
  doc.text(`Period Purchases: ${CURRENCY}${data.summary.totalPurchases.toLocaleString()} (${data.summary.purchaseCount} entries)`, 14, summaryY);
  doc.text(`Period Payments: ${CURRENCY}${data.summary.totalPayments.toLocaleString()} (${data.summary.paymentCount} entries)`, 14, summaryY + 5);
  doc.text(`Total Paid (All Time): ${CURRENCY}${data.supplier.total_paid.toLocaleString()}`, 14, summaryY + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Current Balance Due: ${CURRENCY}${data.summary.currentDue.toLocaleString()}`, 14, summaryY + 15);

  // Purchase History Table
  let tableY = summaryY + 24;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Purchase History (Selected Period)', 14, tableY);

  if (data.purchases.length > 0) {
    autoTable(doc, {
      startY: tableY + 4,
      head: [['Date', 'Invoice', 'Total', 'Paid', 'Due']],
      body: data.purchases.map(p => [
        format(new Date(p.purchase_date), 'MMM dd, yyyy'),
        p.invoice_number || '-',
        `${CURRENCY}${Number(p.total_amount).toLocaleString()}`,
        `${CURRENCY}${Number(p.paid_amount).toLocaleString()}`,
        `${CURRENCY}${Number(p.due_amount).toLocaleString()}`,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    tableY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('No purchases in selected period.', 14, tableY + 8);
    tableY += 14;
  }

  // Payment History Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment History (Selected Period)', 14, tableY);

  if (data.payments.length > 0) {
    autoTable(doc, {
      startY: tableY + 4,
      head: [['Date', 'Amount', 'Method', 'Reference']],
      body: data.payments.map(p => [
        format(new Date(p.payment_date), 'MMM dd, yyyy'),
        `${CURRENCY}${Number(p.amount).toLocaleString()}`,
        p.payment_method,
        p.reference_number || '-',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] }, // Green for payments
    });
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('No payments in selected period.', 14, tableY + 8);
  }

  addFooter(doc);
  doc.save(`supplier-report-${data.supplier.name.replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateAllSuppliersPDF(
  data: AllSuppliersReportData,
  dateRange: { start: Date; end: Date }
) {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'All Suppliers Summary Report', dateRange);

  // Summary Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summaryY = startY + 6;
  doc.text(`Total Suppliers: ${data.summary.supplierCount}`, 14, summaryY);
  doc.text(`Period Purchases: ${CURRENCY}${data.summary.totalPurchases.toLocaleString()}`, 70, summaryY);
  doc.text(`Period Payments: ${CURRENCY}${data.summary.totalPayments.toLocaleString()}`, 130, summaryY);
  doc.text(`Total Outstanding: ${CURRENCY}${data.summary.totalDue.toLocaleString()}`, 14, summaryY + 5);

  // Suppliers Table
  autoTable(doc, {
    startY: summaryY + 12,
    head: [['Supplier', 'Phone', 'Purchases', 'Payments', 'Current Due']],
    body: data.suppliers.map(s => [
      s.name,
      s.phone || '-',
      `${CURRENCY}${s.purchaseAmount.toLocaleString()} (${s.purchaseCount})`,
      `${CURRENCY}${s.paidAmount.toLocaleString()} (${s.paymentCount})`,
      `${CURRENCY}${s.dueAmount.toLocaleString()}`,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [245, 158, 11] }, // Orange
    foot: [[
      'TOTAL',
      '',
      `${CURRENCY}${data.summary.totalPurchases.toLocaleString()}`,
      `${CURRENCY}${data.summary.totalPayments.toLocaleString()}`,
      `${CURRENCY}${data.summary.totalDue.toLocaleString()}`,
    ]],
    footStyles: { fillColor: [243, 244, 246], fontStyle: 'bold', textColor: [0, 0, 0] },
  });

  addFooter(doc);
  doc.save(`all-suppliers-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
