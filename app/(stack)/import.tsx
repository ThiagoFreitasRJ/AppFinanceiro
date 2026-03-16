import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useAuthContext } from '@/lib/hooks/useAuthContext';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/format';
import { parseCSV, parseOFX, ParsedTransaction } from '@/lib/utils/importParser';
import { CATEGORIES } from '@/types';
import { colors } from '@/theme/colors';

export default function ImportScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const { addTransaction } = useTransactions(profile?.id);

  const [parsed, setParsed] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState('');

  async function handlePickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/csv', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setFileName(asset.name);
      setLoading(true);

      const content = await FileSystem.readAsStringAsync(asset.uri);
      const isOFX = asset.name.toLowerCase().endsWith('.ofx') || content.includes('<OFX>') || content.includes('<ofx>');

      const transactions = isOFX ? parseOFX(content) : parseCSV(content);

      if (transactions.length === 0) {
        Alert.alert('Atenção', 'Nenhuma transação encontrada no arquivo. Verifique o formato (CSV ou OFX).');
      }

      setParsed(transactions);
      setLoading(false);
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Erro', e?.message || 'Não foi possível ler o arquivo');
    }
  }

  function toggleSelect(index: number) {
    setParsed(prev => prev.map((t, i) => i === index ? { ...t, selected: !t.selected } : t));
  }

  function toggleAll(value: boolean) {
    setParsed(prev => prev.map(t => ({ ...t, selected: value })));
  }

  function updateCategory(index: number, category: string) {
    setParsed(prev => prev.map((t, i) => i === index ? { ...t, suggestedCategory: category } : t));
  }

  async function handleImport() {
    const selected = parsed.filter(t => t.selected);
    if (selected.length === 0) {
      Alert.alert('Atenção', 'Selecione ao menos uma transação para importar');
      return;
    }

    Alert.alert('Importar', `Importar ${selected.length} transações?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Importar',
        onPress: async () => {
          setImporting(true);
          let imported = 0;
          for (const t of selected) {
            const result = await addTransaction({
              type: t.type,
              amount: t.amount,
              description: t.description,
              category: t.suggestedCategory,
              payment_method: 'transferencia',
              date: t.date,
            });
            if (!result?.error) imported++;
          }
          setImporting(false);
          Alert.alert('Concluído!', `${imported} transações importadas com sucesso! 🎉`);
          setParsed([]);
          setFileName('');
        },
      },
    ]);
  }

  const selectedCount = parsed.filter(t => t.selected).length;
  const allSelected = parsed.length > 0 && selectedCount === parsed.length;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Importar Extrato</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>📁 Formatos suportados</Text>
          <Text style={styles.infoText}>• CSV (extratos do banco, exportação do Excel)</Text>
          <Text style={styles.infoText}>• OFX (Open Financial Exchange — padrão bancário)</Text>
          <Text style={styles.infoNote}>A categoria é detectada automaticamente pela descrição</Text>
        </Card>

        {/* Pick file button */}
        <Button onPress={handlePickFile} loading={loading} size="lg">
          📂 Selecionar Arquivo
        </Button>

        {fileName !== '' && (
          <View style={styles.fileRow}>
            <Text style={styles.fileIcon}>📄</Text>
            <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
          </View>
        )}

        {/* Preview */}
        {parsed.length > 0 && (
          <>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>{parsed.length} transações encontradas</Text>
              <TouchableOpacity onPress={() => toggleAll(!allSelected)} style={styles.selectAllBtn}>
                <Text style={styles.selectAllText}>{allSelected ? 'Desmarcar todas' : 'Marcar todas'}</Text>
              </TouchableOpacity>
            </View>

            {parsed.map((t, i) => {
              const catInfo = CATEGORIES.find(c => c.id === t.suggestedCategory);
              return (
                <Card key={i} style={[styles.txCard, !t.selected && styles.txCardDisabled]}>
                  <View style={styles.txRow}>
                    <TouchableOpacity onPress={() => toggleSelect(i)} style={styles.checkbox}>
                      <Text style={styles.checkboxText}>{t.selected ? '☑️' : '⬜'}</Text>
                    </TouchableOpacity>
                    <View style={styles.txInfo}>
                      <Text style={styles.txDesc} numberOfLines={1}>{t.description}</Text>
                      <Text style={styles.txDate}>{t.date}</Text>
                    </View>
                    <View style={styles.txAmountWrap}>
                      <Text style={[styles.txAmount, { color: t.type === 'entrada' ? colors.emerald : colors.red }]}>
                        {t.type === 'saida' ? '-' : '+'}{formatCurrency(t.amount)}
                      </Text>
                    </View>
                  </View>

                  {/* Category selector */}
                  {t.selected && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                      {CATEGORIES.map(c => (
                        <TouchableOpacity
                          key={c.id}
                          onPress={() => updateCategory(i, c.id)}
                          style={[styles.catChip, t.suggestedCategory === c.id && styles.catChipActive]}
                        >
                          <Text style={styles.catChipEmoji}>{c.icon}</Text>
                          <Text style={[styles.catChipText, t.suggestedCategory === c.id && styles.catChipTextActive]}>
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </Card>
              );
            })}

            <Button onPress={handleImport} loading={importing} size="lg">
              ✅ Importar {selectedCount} transaç{selectedCount !== 1 ? 'ões' : 'ão'}
            </Button>
          </>
        )}

        {parsed.length === 0 && !loading && fileName === '' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Sem arquivo selecionado</Text>
            <Text style={styles.emptySub}>Importe seus extratos bancários em CSV ou OFX</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: colors.text },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.text },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  infoCard: { gap: 6 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  infoText: { fontSize: 13, color: colors.textMuted },
  infoNote: { fontSize: 12, color: colors.textFaint, marginTop: 4, fontStyle: 'italic' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.border },
  fileIcon: { fontSize: 18 },
  fileName: { flex: 1, fontSize: 13, color: colors.textMuted },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  selectAllBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.blueBg, borderWidth: 1, borderColor: colors.blueBorder },
  selectAllText: { fontSize: 12, color: colors.blue, fontWeight: '600' },
  txCard: { gap: 10, opacity: 1 },
  txCardDisabled: { opacity: 0.4 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { padding: 2 },
  checkboxText: { fontSize: 18 },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 13, color: colors.text, fontWeight: '500' },
  txDate: { fontSize: 11, color: colors.textFaint, marginTop: 2 },
  txAmountWrap: { alignItems: 'flex-end' },
  txAmount: { fontSize: 14, fontWeight: '700' },
  catScroll: { marginTop: 4 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, marginRight: 6 },
  catChipActive: { backgroundColor: colors.blueBg, borderColor: colors.blue },
  catChipEmoji: { fontSize: 12 },
  catChipText: { fontSize: 11, color: colors.textFaint, fontWeight: '600' },
  catChipTextActive: { color: colors.blue },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.textFaint, textAlign: 'center' },
});
