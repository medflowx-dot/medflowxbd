import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { DailySummaryReport, SalesReportItem, SupplierDueItem } from '@/hooks/useReports';

const CURRENCY = '৳';

export interface CustomerDueItem {
  id: string;
  name: string;
  phone: string | null;
  total_due: number;
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
  
  // Generated date
  doc.setFontSize(8);
  doc.text(`Generated: ${format(new Date(), 'PPP p')}`, 14, 44);
  doc.setTextColor(0);
  
  return 50; // Return Y position for content to start
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
