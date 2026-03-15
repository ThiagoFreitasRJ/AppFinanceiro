import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useAuthContext as useAuth } from '@/lib/hooks/useAuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  async function handleRegister() {
    if (!name || !email || !password) { Alert.alert('Atenção', 'Preencha todos os campos'); return; }
    if (password.length < 6) { Alert.alert('Atenção', 'Senha deve ter pelo menos 6 caracteres'); return; }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (error) Alert.alert('Erro', (error as Error).message || 'Não foi possível criar a conta');
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.logo}><Text style={styles.logoEmoji}>🚀</Text></View>
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>Comece sua jornada financeira</Text>

      <View style={styles.card}>
        <View style={styles.form}>
          <Input label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" autoCapitalize="words" />
          <Input label="Email" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" placeholder="seu@email.com" />
          <Input label="Senha" value={password} onChangeText={setPassword}
            secureTextEntry placeholder="Mínimo 6 caracteres" />
          <Button onPress={handleRegister} loading={loading} size="lg">
            Criar conta grátis
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity><Text style={styles.link}>Entrar</Text></TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  logo: { width: 80, height: 80, borderRadius: 24, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoEmoji: { fontSize: 36 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textFaint, marginBottom: 32 },
  card: { width: '100%', backgroundColor: colors.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border },
  form: { gap: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 13, color: colors.textFaint },
  link: { fontSize: 13, color: colors.blue, fontWeight: '700' },
});
