import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Transaction, Goal } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

interface ReportData {
  userName: string;
  month: string;
  income: number;
  expense: number;
  savings: number;
  transactions: Transaction[];
  goals: Goal[];
  categoryTotals: Record<string, number>;
}

function buildHTML(data: ReportData): string {
  const categoryRows = Object.entries(data.categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;text-transform:capitalize">${cat}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;color:#e53e3e">${formatCurrency(amount)}</td>
      </tr>
    `).join('');

  const transactionRows = data.transactions.slice(0, 50).map(t => `
    <tr>
      <td style="padding:6px;border-bottom:1px solid #eee;font-size:12px">${t.date}</td>
      <td style="padding:6px;border-bottom:1px solid #eee;font-size:12px">${t.description || '-'}</td>
      <td style="padding:6px;border-bottom:1px solid #eee;font-size:12px;text-transform:capitalize">${t.category}</td>
      <td style="padding:6px;border-bottom:1px solid #eee;font-size:12px;text-align:right;color:${t.type === 'entrada' ? '#38a169' : '#e53e3e'}">${t.type === 'saida' ? '-' : '+'}${formatCurrency(t.amount)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #1a202c; margin: 0; padding: 20px; }
        h1 { color: #0066ff; font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 16px; color: #4a5568; margin-top: 24px; margin-bottom: 8px; border-bottom: 2px solid #0066ff; padding-bottom: 4px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .logo { font-size: 28px; }
        .meta { text-align: right; font-size: 12px; color: #718096; }
        .summary { display: flex; gap: 12px; margin-bottom: 20px; }
        .card { flex: 1; padding: 12px; border-radius: 8px; text-align: center; }
        .card-income { background: #f0fff4; border: 1px solid #68d391; }
        .card-expense { background: #fff5f5; border: 1px solid #fc8181; }
        .card-savings { background: #ebf8ff; border: 1px solid #63b3ed; }
        .card-label { font-size: 11px; color: #718096; text-transform: uppercase; font-weight: bold; }
        .card-value { font-size: 18px; font-weight: bold; margin-top: 4px; }
        .income-value { color: #38a169; }
        .expense-value { color: #e53e3e; }
        .savings-value { color: #3182ce; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #0066ff; color: white; padding: 8px; text-align: left; font-size: 12px; }
        .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #a0aec0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">💰</div>
          <h1>FinanceApp</h1>
          <div style="font-size:13px;color:#718096">Relatório Financeiro · ${data.userName}</div>
        </div>
        <div class="meta">
          <div><strong>Período:</strong> ${data.month}</div>
          <div><strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')}</div>
        </div>
      </div>

      <div class="summary">
        <div class="card card-income">
          <div class="card-label">Entradas</div>
          <div class="card-value income-value">${formatCurrency(data.income)}</div>
        </div>
        <div class="card card-expense">
          <div class="card-label">Saídas</div>
          <div class="card-value expense-value">${formatCurrency(data.expense)}</div>
        </div>
        <div class="card card-savings">
          <div class="card-label">Economia</div>
          <div class="card-value savings-value">${formatCurrency(data.savings)}</div>
        </div>
      </div>

      <h2>Gastos por Categoria</h2>
      <table>
        <thead><tr><th>Categoria</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${categoryRows}</tbody>
      </table>

      <h2>Transações (últimas 50)</h2>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th style="text-align:right">Valor</th>
          </tr>
        </thead>
        <tbody>${transactionRows}</tbody>
      </table>

      <div class="footer">Relatório gerado pelo FinanceApp — Controle Financeiro Gamificado</div>
    </body>
    </html>
  `;
}

export async function generatePDFReport(data: ReportData): Promise<void> {
  const html = buildHTML(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Relatório Financeiro' });
  }
}
