export function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return 'R$ ' + formatted;
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function calculateXP(amount: number): number {
  if (amount <= 50) return 10;
  if (amount <= 100) return 25;
  if (amount <= 250) return 50;
  if (amount <= 500) return 100;
  if (amount <= 1000) return 200;
  return 300 + Math.floor((amount - 1000) / 10);
}

export function getLevelFromXP(xp: number): number {
  if (xp <= 500) return Math.max(1, Math.ceil(xp / 100));
  if (xp <= 1500) return 5 + Math.ceil((xp - 500) / 200);
  if (xp <= 3500) return 10 + Math.ceil((xp - 1500) / 400);
  if (xp <= 7000) return 15 + Math.ceil((xp - 3500) / 700);
  if (xp <= 12000) return 20 + Math.ceil((xp - 7000) / 1000);
  return 25 + Math.ceil((xp - 12000) / 2000);
}

export function getLevelName(level: number): string {
  if (level <= 5) return 'Iniciante';
  if (level <= 10) return 'Poupador';
  if (level <= 15) return 'Investidor';
  if (level <= 20) return 'Magnata';
  if (level <= 25) return 'Bilionário';
  return 'Lenda';
}

export function getLevelBadge(level: number): string {
  if (level <= 5) return '🌱';
  if (level <= 10) return '💰';
  if (level <= 15) return '📈';
  if (level <= 20) return '👑';
  if (level <= 25) return '💎';
  return '🏆';
}

export function getXPForNextLevel(level: number): number {
  if (level <= 5) return 500;
  if (level <= 10) return 1500;
  if (level <= 15) return 3500;
  if (level <= 20) return 7000;
  if (level <= 25) return 12000;
  return 12000 + (level - 25) * 2000;
}
