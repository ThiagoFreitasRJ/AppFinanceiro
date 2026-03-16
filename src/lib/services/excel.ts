import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Transaction, Goal } from '@/types';

interface ExcelReportData {
  userName: string;
  month: string;
  income: number;
  expense: number;
  savings: number;
  transactions: Transaction[];
  goals: Goal[];
}

export async function generateExcelReport(data: ExcelReportData): Promise<void> {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = [
    { Campo: 'Usuário', Valor: data.userName },
    { Campo: 'Período', Valor: data.month },
    { Campo: 'Total Entradas', Valor: data.income },
    { Campo: 'Total Saídas', Valor: data.expense },
    { Campo: 'Economia', Valor: data.savings },
    { Campo: 'Taxa de Poupança', Valor: data.income > 0 ? `${((data.savings / data.income) * 100).toFixed(1)}%` : '0%' },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Resumo');

  // Sheet 2: Transactions
  const txData = data.transactions.map(t => ({
    Data: t.date,
    Tipo: t.type === 'entrada' ? 'Entrada' : 'Saída',
    Descrição: t.description || '-',
    Categoria: t.category,
    'Método': t.payment_method,
    Valor: t.type === 'entrada' ? t.amount : -t.amount,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(txData), 'Transações');

  // Sheet 3: Goals
  const goalsData = data.goals.map(g => ({
    Nome: g.name,
    'Meta': g.target_amount,
    'Acumulado': g.current_amount,
    'Progresso': `${Math.round((g.current_amount / g.target_amount) * 100)}%`,
    Prazo: g.deadline || '-',
    Status: g.completed_at ? 'Concluído' : 'Em andamento',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(goalsData), 'Objetivos');

  // Write and share
  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const fileName = `relatorio_${data.month.replace('-', '_')}.xlsx`;
  const uri = (FileSystem.documentDirectory || '') + fileName;

  await FileSystem.writeAsStringAsync(uri, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Exportar Excel',
    });
  }
}
