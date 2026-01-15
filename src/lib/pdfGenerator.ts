import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { DailySummaryReport, SalesReportItem, SupplierDueItem, MedicineProfitItem } from '@/hooks/useReports';
import type { StockOrder } from '@/hooks/useStockOrders';

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
      profit: acc.profit + (row.profit || 0),
      cost: acc.cost + (row.cost || 0),
    }),
    { total: 0, paid: 0, due: 0, profit: 0, cost: 0 }
  );

  const marginPercent = totals.cost > 0 ? ((totals.profit / totals.cost) * 100).toFixed(1) : '0';

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
  doc.text(`Total Profit: ${CURRENCY}${totals.profit.toLocaleString()} (${marginPercent}% margin)`, 14, summaryY + 5);
  doc.text(`Number of Entries: ${data.length}`, 126, summaryY + 5);

  // Table
  autoTable(doc, {
    startY: summaryY + 12,
    head: [['Entry ID', 'Type', 'Date', 'Total', 'Cost', 'Profit', 'Method']],
    body: data.map(row => [
      row.invoice_number,
      row.entry_type === 'quick' ? 'Quick' : 'Detailed',
      format(new Date(row.sale_date), 'MMM dd, yyyy'),
      `${CURRENCY}${row.total_amount.toLocaleString()}`,
      row.cost !== undefined ? `${CURRENCY}${row.cost.toLocaleString()}` : '-',
      row.profit !== undefined ? `${row.profit >= 0 ? '+' : ''}${CURRENCY}${row.profit.toLocaleString()}` : '-',
      row.payment_method,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  addFooter(doc);
  doc.save(`sales-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function generateProfitReportPDF(
  data: MedicineProfitItem[],
  dateRange: { start: Date; end: Date }
) {
  const doc = new jsPDF();
  const startY = addHeader(doc, 'Profit Analysis by Medicine', dateRange);

  // Calculate totals
  const totals = data.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.total_revenue,
      cost: acc.cost + row.total_cost,
      profit: acc.profit + row.profit,
      quantity: acc.quantity + row.total_quantity,
    }),
    { revenue: 0, cost: 0, profit: 0, quantity: 0 }
  );

  const overallMargin = totals.cost > 0 ? ((totals.profit / totals.cost) * 100).toFixed(1) : '0';

  // Summary
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const summaryY = startY + 6;
  doc.text(`Total Revenue: ${CURRENCY}${totals.revenue.toLocaleString()}`, 14, summaryY);
  doc.text(`Total Cost: ${CURRENCY}${totals.cost.toLocaleString()}`, 70, summaryY);
  doc.text(`Total Profit: ${CURRENCY}${totals.profit.toLocaleString()}`, 126, summaryY);
  doc.text(`Overall Margin: ${overallMargin}%`, 14, summaryY + 5);
  doc.text(`Items Sold: ${totals.quantity}`, 70, summaryY + 5);
  doc.text(`Medicines: ${data.length}`, 126, summaryY + 5);

  // Table
  autoTable(doc, {
    startY: summaryY + 12,
    head: [['Medicine', 'Qty Sold', 'Revenue', 'Cost', 'Profit', 'Margin %']],
    body: data.map(row => [
      row.medicine_name,
      row.total_quantity.toString(),
      `${CURRENCY}${row.total_revenue.toLocaleString()}`,
      `${CURRENCY}${row.total_cost.toLocaleString()}`,
      `${row.profit >= 0 ? '+' : ''}${CURRENCY}${row.profit.toLocaleString()}`,
      `${row.margin_percent.toFixed(1)}%`,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [34, 197, 94] },
  });

  addFooter(doc);
  doc.save(`profit-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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

export function generateStockOrderPDF(order: StockOrder) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MedFlowx', 14, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Stock Order Note', 14, 30);
  
  // Order info
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Order Date: ${format(new Date(order.created_at), 'PPP')}`, 14, 40);
  doc.text(`Status: ${order.status.toUpperCase()}`, 14, 46);
  doc.setTextColor(0);
  
  // Manufacturer info box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, 52, 182, 30, 2, 2, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Manufacturer:', 18, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(order.manufacturer, 55, 62);
  
  if (order.manufacturer_phone) {
    doc.setFontSize(10);
    doc.text(`Phone: ${order.manufacturer_phone}`, 18, 72);
  }
  
  let startY = 90;
  
  // Notes if present
  if (order.notes) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', 14, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(order.notes, 14, startY + 6);
    startY += 16;
  }
  
  // Items table
  if (order.items && order.items.length > 0) {
    autoTable(doc, {
      startY,
      head: [['#', 'Medicine Name', 'Current Stock', 'Min Level', 'Order Qty', 'Unit']],
      body: order.items.map((item, index) => [
        (index + 1).toString(),
        item.medicine_name,
        item.current_stock.toString(),
        item.min_stock_level.toString(),
        item.quantity_to_order.toString(),
        item.unit,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 197, 94] },
      columnStyles: {
        0: { cellWidth: 15 },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 25 },
      },
    });
    
    // Total items
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Items: ${order.items.length}`, 14, finalY + 10);
    
    const totalQty = order.items.reduce((sum, item) => sum + item.quantity_to_order, 0);
    doc.text(`Total Quantity: ${totalQty}`, 80, finalY + 10);
  }
  
  // Status timestamps
  let statusY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY + 25 || startY + 20;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  
  if (order.submitted_at) {
    doc.text(`Submitted: ${format(new Date(order.submitted_at), 'PPP p')}`, 14, statusY);
    statusY += 5;
  }
  if (order.received_at) {
    doc.text(`Received: ${format(new Date(order.received_at), 'PPP p')}`, 14, statusY);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.text(
    `Generated: ${format(new Date(), 'PPP p')}`,
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );
  
  doc.save(`order-note-${order.manufacturer.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(order.created_at), 'yyyy-MM-dd')}.pdf`);
}

export function generateAllOrdersPDF(orders: StockOrder[], statusFilter?: string) {
  const doc = new jsPDF();
  
  const filteredOrders = statusFilter 
    ? orders.filter(o => o.status === statusFilter)
    : orders;
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MedFlowx', 14, 20);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const title = statusFilter 
    ? `Stock Orders - ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`
    : 'All Stock Orders';
  doc.text(title, 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${format(new Date(), 'PPP p')}`, 14, 38);
  doc.setTextColor(0);
  
  // Summary
  const pending = orders.filter(o => o.status === 'pending').length;
  const submitted = orders.filter(o => o.status === 'submitted').length;
  const received = orders.filter(o => o.status === 'received').length;
  
  doc.setFontSize(9);
  doc.text(`Pending: ${pending} | Submitted: ${submitted} | Received: ${received} | Total: ${orders.length}`, 14, 46);
  
  // Orders table
  autoTable(doc, {
    startY: 54,
    head: [['Date', 'Manufacturer', 'Items', 'Status', 'Submitted', 'Received']],
    body: filteredOrders.map(order => [
      format(new Date(order.created_at), 'MMM dd, yyyy'),
      order.manufacturer,
      order.items?.length.toString() || '0',
      order.status.toUpperCase(),
      order.submitted_at ? format(new Date(order.submitted_at), 'MMM dd') : '-',
      order.received_at ? format(new Date(order.received_at), 'MMM dd') : '-',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [34, 197, 94] },
    columnStyles: {
      3: { fontStyle: 'bold' },
    },
  });
  
  // Footer with page numbers
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
  
  doc.save(`stock-orders-${statusFilter || 'all'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
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
