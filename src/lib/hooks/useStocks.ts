'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { Stock, AssetType } from '@/types';
import { getQuotes, BRAPIQuote } from '../utils/brapi';

export interface StockWithQuote extends Stock {
  quote: BRAPIQuote | null;
  currentValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercent: number;
}

export function useStocks(userId?: string) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [quotes, setQuotes] = useState<Record<string, BRAPIQuote>>({});
  const [loading, setLoading] = useState(true);
  const [quotesLoading, setQuotesLoading] = useState(false);

  const fetchStocks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from('stocks').select('*').eq('user_id', userId);
    setStocks(data || []);
    setLoading(false);

    if (data?.length) {
      setQuotesLoading(true);
      const tickers = data.map(s => s.ticker);
      const quotesData = await getQuotes(tickers);
      if (quotesData.length > 0) {
        const quotesMap: Record<string, BRAPIQuote> = {};
        quotesData.forEach(q => { quotesMap[q.symbol] = q; });
        // Merge instead of replace so a partial failure doesn't wipe existing quotes
        setQuotes(prev => ({ ...prev, ...quotesMap }));
      }
      setQuotesLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  async function addStock(ticker: string, quantity: number, avgPrice: number, assetType: AssetType = 'acao') {
    if (!userId) return null;
    const { data: existing } = await supabase
      .from('stocks')
      .select('*')
      .eq('user_id', userId)
      .eq('ticker', ticker.toUpperCase())
      .single();

    let result;
    if (existing) {
      const totalQty = existing.quantity + quantity;
      const newAvgPrice = (existing.quantity * existing.avg_price + quantity * avgPrice) / totalQty;
      result = await supabase
        .from('stocks')
        .update({ quantity: totalQty, avg_price: newAvgPrice, asset_type: assetType })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('stocks')
        .insert({ user_id: userId, ticker: ticker.toUpperCase(), quantity, avg_price: avgPrice, asset_type: assetType })
        .select()
        .single();
    }

    await fetchStocks();
    return result;
  }

  async function removeStock(id: string) {
    const { error } = await supabase.from('stocks').delete().eq('id', id);
    if (!error) setStocks(prev => prev.filter(s => s.id !== id));
    return { error };
  }

  async function updateStock(id: string, quantity: number, avgPrice: number) {
    const { data, error } = await supabase
      .from('stocks')
      .update({ quantity, avg_price: avgPrice })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) setStocks(prev => prev.map(s => s.id === id ? data : s));
    return { data, error };
  }

  const stocksWithQuotes: StockWithQuote[] = stocks.map(stock => {
    const quote = quotes[stock.ticker] || null;
    const currentPrice = quote?.regularMarketPrice || stock.avg_price;
    const currentValue = currentPrice * stock.quantity;
    const totalCost = stock.avg_price * stock.quantity;
    const profitLoss = currentValue - totalCost;
    const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
    return { ...stock, quote, currentValue, totalCost, profitLoss, profitLossPercent };
  });

  const totalInvested = stocksWithQuotes.reduce((sum, s) => sum + s.totalCost, 0);
  const totalCurrentValue = stocksWithQuotes.reduce((sum, s) => sum + s.currentValue, 0);
  const totalProfitLoss = totalCurrentValue - totalInvested;
  const totalProfitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  return {
    stocks: stocksWithQuotes,
    loading,
    quotesLoading,
    addStock,
    removeStock,
    updateStock,
    refetch: fetchStocks,
    totalInvested,
    totalCurrentValue,
    totalProfitLoss,
    totalProfitLossPercent,
  };
}
