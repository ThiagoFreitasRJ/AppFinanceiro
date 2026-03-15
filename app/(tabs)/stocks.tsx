import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuthContext as useAuth } from '@/lib/hooks/useAuthContext';
import { useStocks } from '@/lib/hooks/useStocks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AppModal } from '@/components/ui/AppModal';
import { formatCurrency, formatPercent } from '@/lib/utils/format';
import { colors } from '@/theme/colors';
import { ASSET_TYPES, YIELD_TYPES, FIXED_INCOME_PRODUCTS, AssetType, YieldType } from '@/types';

const QUOTABLE: AssetType[] = ['acao', 'fii', 'etf', 'bdr', 'cripto'];

export default function StocksScreen() {
  const { profile } = useAuth();
  const { stocks, loading, quotesLoading, addStock, addFixedIncome, removeStock, totalInvested, totalCurrentValue, totalProfitLoss, totalProfitLossPercent } = useStocks(profile?.id);

  const [showModal, setShowModal] = useState(false);
  const [assetType, setAssetType] = useState<AssetType>('acao');

  // Variable asset fields
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');

  // Fixed income fields
  const [fiName, setFiName] = useState('');
  const [fiProduct, setFiProduct] = useState('CDB');
  const [fiValue, setFiValue] = useState('');
  const [fiYieldType, setFiYieldType] = useState<YieldType>('pos_cdi');
  const [fiYieldRate, setFiYieldRate] = useState('');
  const [fiInstitution, setFiInstitution] = useState('');
  const [fiPurchaseDate, setFiPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [fiMaturity, setFiMaturity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function resetModal() {
    setTicker(''); setQuantity(''); setAvgPrice('');
    setFiName(''); setFiProduct('CDB'); setFiValue('');
    setFiYieldRate(''); setFiInstitution(''); setFiMaturity('');
    setFiPurchaseDate(new Date().toISOString().split('T')[0]);
  }

  async function handleAdd() {
    if (assetType === 'renda_fixa') {
      const val = parseFloat(fiValue.replace(',', '.'));
      const rate = parseFloat(fiYieldRate.replace(',', '.'));
      if (!fiInstitution || !val || !rate) { Alert.alert('Atenção', 'Preencha todos os campos'); return; }
      setSubmitting(true);
      const name = `${fiProduct} ${fiInstitution}`;
      await addFixedIncome(name, val, {
        purchase_date: fiPurchaseDate, yield_rate: rate, yield_type: fiYieldType,
        institution: fiInstitution, maturity_date: fiMaturity || null, admin_fee: 0,
      });
    } else {
      const qty = parseFloat(quantity.replace(',', '.'));
      const price = parseFloat(avgPrice.replace(',', '.'));
      if (!ticker || !qty || !price) { Alert.alert('Atenção', 'Preencha todos os campos'); return; }
      setSubmitting(true);
      await addStock(ticker.trim().toUpperCase(), qty, price, assetType);
    }
    setSubmitting(false);
    setShowModal(false);
    resetModal();
  }

  const grouped = ASSET_TYPES.reduce((acc, type) => {
    const items = stocks.filter(s => s.asset_type === type.id);
    if (items.length) acc[type.id] = items;
    return acc;
  }, {} as Record<string, typeof stocks>);

  const isProfit = totalProfitLoss >= 0;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Carteira</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {quotesLoading && <ActivityIndicator size="small" color={colors.blue} />}
            <Button onPress={() => { resetModal(); setShowModal(true); }} size="sm">+ Ativo</Button>
          </View>
        </View>

        {/* Portfolio Summary */}
        {stocks.length > 0 && (
          <Card style={styles.portfolioCard}>
            <Text style={styles.portfolioLabel}>Patrimônio Total</Text>
            <Text style={styles.portfolioValue}>{formatCurrency(totalCurrentValue)}</Text>
            <View style={styles.portfolioRow}>
              <View>
                <Text style={styles.portfolioSubLabel}>Investido</Text>
                <Text style={styles.portfolioSub}>{formatCurrency(totalInvested)}</Text>
              </View>
              <View style={[styles.plBadge, { backgroundColor: isProfit ? colors.emeraldBg : colors.redBg, borderColor: isProfit ? colors.emeraldBorder : colors.redBorder }]}>
                <Text style={[styles.plText, { color: isProfit ? colors.emerald : colors.red }]}>
                  {isProfit ? '+' : ''}{formatCurrency(totalProfitLoss)} ({isProfit ? '+' : ''}{formatPercent(totalProfitLossPercent)})
                </Text>
              </View>
            </View>
          </Card>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={colors.blue} style={{ marginTop: 40 }} />
        ) : stocks.length === 0 ? (
          <Card style={styles.empty}>
            <Text style={styles.emptyEmoji}>📈</Text>
            <Text style={styles.emptyTitle}>Carteira vazia</Text>
            <Text style={styles.emptyDesc}>Adicione seus investimentos para acompanhar o desempenho e P&L.</Text>
            <Button onPress={() => setShowModal(true)} size="sm">Adicionar ativo</Button>
          </Card>
        ) : (
          Object.entries(grouped).map(([typeId, items]) => {
            const typeInfo = ASSET_TYPES.find(t => t.id === typeId);
            return (
              <View key={typeId}>
                <Text style={styles.groupTitle}>{typeInfo?.icon} {typeInfo?.label}</Text>
                <Card style={{ gap: 4, padding: 8 }}>
                  {items.map(stock => {
                    const isRF = stock.asset_type === 'renda_fixa';
                    const isPos = stock.profitLoss >= 0;
                    return (
                      <TouchableOpacity key={stock.id} style={styles.stockRow}
                        onLongPress={() => Alert.alert('Remover', `Remover ${stock.ticker}?`, [
                          { text: 'Cancelar' }, { text: 'Remover', style: 'destructive', onPress: () => removeStock(stock.id) }
                        ])}>
                        <View style={styles.stockLeft}>
                          <Text style={styles.stockTicker}>{stock.ticker}</Text>
                          {isRF ? (
                            <Text style={styles.stockSub}>{stock.institution} · {stock.yield_rate}% {stock.yield_type?.toUpperCase()}</Text>
                          ) : (
                            <Text style={styles.stockSub}>{stock.quantity} cotas · PM {formatCurrency(stock.avg_price)}</Text>
                          )}
                        </View>
                        <View style={styles.stockRight}>
                          <Text style={styles.stockValue}>{formatCurrency(stock.currentValue)}</Text>
                          {!isRF && (
                            <Text style={[styles.stockPL, { color: isPos ? colors.emerald : colors.red }]}>
                              {isPos ? '+' : ''}{formatPercent(stock.profitLossPercent)}
                            </Text>
                          )}
                          {isRF && <Text style={[styles.stockPL, { color: colors.blue }]}>{stock.yield_rate}% a.a.</Text>}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </Card>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Asset Modal */}
      <AppModal visible={showModal} onClose={() => setShowModal(false)} title="Adicionar Ativo">
        <View style={styles.modalContent}>
          {/* Asset type selector */}
          <Text style={styles.fieldLabel}>Tipo de ativo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
              {ASSET_TYPES.map(t => (
                <TouchableOpacity key={t.id} style={[styles.typeChip, assetType === t.id && styles.typeChipActive]}
                  onPress={() => setAssetType(t.id)}>
                  <Text style={{ fontSize: 16 }}>{t.icon}</Text>
                  <Text style={[styles.typeChipText, assetType === t.id && { color: colors.blue }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {assetType === 'renda_fixa' ? (
            <>
              {/* Fixed income form */}
              <Text style={styles.fieldLabel}>Produto</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                  {FIXED_INCOME_PRODUCTS.map(p => (
                    <TouchableOpacity key={p} style={[styles.typeChip, fiProduct === p && styles.typeChipActive]}
                      onPress={() => setFiProduct(p)}>
                      <Text style={[styles.typeChipText, fiProduct === p && { color: colors.blue }]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Input label="Instituição" value={fiInstitution} onChangeText={setFiInstitution} placeholder="Ex: Nubank, XP..." />
              <Input label="Valor investido" prefix="R$" value={fiValue} onChangeText={setFiValue} keyboardType="decimal-pad" placeholder="10.000,00" />

              <Text style={styles.fieldLabel}>Tipo de rendimento</Text>
              <View style={styles.yieldRow}>
                {YIELD_TYPES.map(y => (
                  <TouchableOpacity key={y.id} style={[styles.yieldBtn, fiYieldType === y.id && styles.yieldBtnActive]}
                    onPress={() => setFiYieldType(y.id)}>
                    <Text style={[styles.yieldText, fiYieldType === y.id && { color: colors.blue }]}>{y.label}</Text>
                    <Text style={styles.yieldDesc}>{y.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input label={fiYieldType === 'pos_cdi' ? '% do CDI' : 'Taxa (% a.a.)'}
                suffix="%" value={fiYieldRate} onChangeText={setFiYieldRate} keyboardType="decimal-pad"
                placeholder={fiYieldType === 'pos_cdi' ? '110' : '12.5'} />
              <Input label="Data de compra" value={fiPurchaseDate} onChangeText={setFiPurchaseDate} placeholder="AAAA-MM-DD" />
              <Input label="Vencimento (opcional)" value={fiMaturity} onChangeText={setFiMaturity} placeholder="AAAA-MM-DD" />
            </>
          ) : (
            <>
              <Input label="Ticker" value={ticker} onChangeText={t => setTicker(t.toUpperCase())}
                placeholder={ASSET_TYPES.find(a => a.id === assetType)?.desc || 'Ex: PETR4'}
                autoCapitalize="characters" />
              <Input label="Quantidade" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="100" />
              <Input label="Preço médio" prefix="R$" value={avgPrice} onChangeText={setAvgPrice} keyboardType="decimal-pad" placeholder="28,50" />
            </>
          )}

          <Button onPress={handleAdd} loading={submitting} size="lg">Adicionar</Button>
        </View>
      </AppModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  portfolioCard: { gap: 8 },
  portfolioLabel: { fontSize: 12, color: colors.textFaint, fontWeight: '600' },
  portfolioValue: { fontSize: 28, fontWeight: '800', color: colors.text },
  portfolioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  portfolioSubLabel: { fontSize: 11, color: colors.textFaint },
  portfolioSub: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  plBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  plText: { fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyDesc: { fontSize: 13, color: colors.textFaint, textAlign: 'center', lineHeight: 18 },
  groupTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  stockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  stockLeft: { flex: 1 },
  stockTicker: { fontSize: 15, fontWeight: '700', color: colors.text },
  stockSub: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  stockRight: { alignItems: 'flex-end' },
  stockValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  stockPL: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  modalContent: { padding: 20, gap: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardAlt },
  typeChipActive: { borderColor: colors.blue, backgroundColor: colors.blueBg },
  typeChipText: { fontSize: 12, color: colors.textFaint, fontWeight: '600' },
  yieldRow: { gap: 8 },
  yieldBtn: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardAlt },
  yieldBtnActive: { borderColor: colors.blue, backgroundColor: colors.blueBg },
  yieldText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  yieldDesc: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
});
