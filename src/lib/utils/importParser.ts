import Papa from 'papaparse';

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'entrada' | 'saida';
  suggestedCategory: string;
  selected: boolean;
}

const CATEGORIZATION_RULES: Record<string, string[]> = {
  alimentacao:  ['ifood', 'rappi', 'uber eats', 'restaurante', 'lanchonete', 'mercado', 'padaria', 'supermercado', 'açougue', 'hortifruti'],
  transporte:   ['uber', '99pop', 'cabify', 'posto', 'combustivel', 'estacionamento', 'metrô', 'onibus', 'ônibus', 'trem', 'combustível'],
  moradia:      ['aluguel', 'condominio', 'condomínio', 'luz', 'enel', 'agua', 'água', 'gás', 'gas', 'iptu', 'correios'],
  assinaturas:  ['netflix', 'spotify', 'amazon', 'hbo', 'disney', 'apple', 'youtube premium', 'globoplay', 'prime video', 'chatgpt', 'openai'],
  saude:        ['farmacia', 'farmácia', 'drogaria', 'hospital', 'clinica', 'clínica', 'unimed', 'plano de saude', 'dentista', 'médico'],
  educacao:     ['escola', 'faculdade', 'universidade', 'curso', 'livro', 'material escolar', 'mensalidade'],
  lazer:        ['cinema', 'teatro', 'show', 'ingresso', 'parque', 'clube', 'academia'],
  vestuario:    ['renner', 'riachuelo', 'c&a', 'zara', 'shein', 'roupa', 'calçado', 'sapato'],
  contas:       ['celular', 'internet', 'telefone', 'net ', 'claro', 'vivo', 'tim', 'oi '],
};

export function suggestCategory(description: string): string {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORIZATION_RULES)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'outros';
}

function parseDate(raw: string): string {
  // Try ISO format first
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.substring(0, 10);
  // DD/MM/YYYY
  const match = raw.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  // YYYYMMDD (OFX)
  if (/^\d{8}/.test(raw)) return `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(6, 8)}`;
  return new Date().toISOString().split('T')[0];
}

function parseAmount(raw: string | number): number {
  if (typeof raw === 'number') return Math.abs(raw);
  const cleaned = String(raw).replace(/[R$\s]/g, '').replace(',', '.');
  return Math.abs(parseFloat(cleaned) || 0);
}

export function parseCSV(content: string): ParsedTransaction[] {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const rows = result.data as Record<string, string>[];
  const transactions: ParsedTransaction[] = [];

  for (const row of rows) {
    const keys = Object.keys(row).map(k => k.toLowerCase().trim());
    const vals = Object.values(row);

    // Try to find date, description, amount columns
    const dateKey = Object.keys(row).find(k => /data|date/.test(k.toLowerCase()));
    const descKey = Object.keys(row).find(k => /descri|memo|histor|nome|estabele/.test(k.toLowerCase()));
    const amountKey = Object.keys(row).find(k => /valor|amount|value|debito|credito/.test(k.toLowerCase()));

    if (!dateKey || !amountKey) continue;

    const rawAmount = row[amountKey] || '0';
    const numAmount = parseAmount(rawAmount);
    if (numAmount === 0) continue;

    const rawAmountNum = parseFloat(String(rawAmount).replace(/[R$\s]/g, '').replace(',', '.'));
    const type: 'entrada' | 'saida' = rawAmountNum >= 0 ? 'entrada' : 'saida';

    const description = descKey ? row[descKey] || '' : vals[1] || 'Sem descrição';

    transactions.push({
      date: parseDate(row[dateKey] || ''),
      description: description.trim(),
      amount: numAmount,
      type,
      suggestedCategory: suggestCategory(description),
      selected: true,
    });
  }

  return transactions;
}

export function parseOFX(content: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const stmtRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
  let match;

  while ((match = stmtRegex.exec(content)) !== null) {
    const block = match[1];
    const trntype = (block.match(/<TRNTYPE>(.*?)[\n<]/) || [])[1]?.trim() || '';
    const dtposted = (block.match(/<DTPOSTED>(.*?)[\n<]/) || [])[1]?.trim() || '';
    const trnamt = (block.match(/<TRNAMT>(.*?)[\n<]/) || [])[1]?.trim() || '0';
    const memo = (block.match(/<MEMO>(.*?)[\n<]/) || [])[1]?.trim() || 'Sem descrição';

    const numAmount = parseAmount(trnamt);
    if (numAmount === 0) continue;

    const rawNum = parseFloat(trnamt);
    const type: 'entrada' | 'saida' = rawNum >= 0 ? 'entrada' : 'saida';

    transactions.push({
      date: parseDate(dtposted),
      description: memo,
      amount: numAmount,
      type,
      suggestedCategory: suggestCategory(memo),
      selected: true,
    });
  }

  return transactions;
}
