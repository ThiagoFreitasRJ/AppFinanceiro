import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuthContext as useAuth } from '@/lib/hooks/useAuthContext';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  async function handleLogin() {
    if (!email || !password) { Alert.alert('Atenção', 'Preencha email e senha'); return; }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        Alert.alert('Erro', 'Email ou senha incorretos');
        setShowReset(true);
      } else if (msg.includes('not confirmed')) {
        Alert.alert('Email não confirmado', 'Verifique sua caixa de entrada.');
      } else {
        Alert.alert('Erro', error.message || 'Não foi possível entrar');
      }
    }
  }

  async function handleReset() {
    if (!email) { Alert.alert('Atenção', 'Digite seu email primeiro'); return; }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setResetLoading(false);
    if (error) Alert.alert('Erro', error.message);
    else Alert.alert('Email enviado!', `Link de redefinição enviado para ${email}`);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.logo}>
        <Text style={styles.logoEmoji}>💰</Text>
      </View>
      <Text style={styles.title}>FinanceApp</Text>
      <Text style={styles.subtitle}>Controle financeiro gamificado</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Entrar</Text>
        <Text style={styles.cardSubtitle}>Acesse sua conta</Text>

        <View style={styles.form}>
          <Input label="Email" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" placeholder="seu@email.com" />
          <Input label="Senha" value={password} onChangeText={setPassword}
            secureTextEntry placeholder="••••••••" />

          <TouchableOpacity onPress={() => setShowReset(r => !r)} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {showReset && (
            <View style={styles.resetBox}>
              <Text style={styles.resetTitle}>🔑 Redefinir senha</Text>
              <Text style={styles.resetDesc}>Enviaremos um link para {email || 'seu email'}</Text>
              <Button onPress={handleReset} loading={resetLoading} variant="secondary" size="sm">
                Enviar link de redefinição
              </Button>
            </View>
          )}

          <Button onPress={handleLogin} loading={loading} size="lg">
            Entrar
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Criar conta grátis</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View style={styles.gameTease}>
        <Text style={styles.gameTeaseText}>🎮 Ganhe XP, suba de nível e conquiste badges enquanto cuida das suas finanças</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  logo: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoEmoji: { fontSize: 36 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.textFaint, marginBottom: 32 },
  card: {
    width: '100%', backgroundColor: colors.card,
    borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border,
    gap: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  cardSubtitle: { fontSize: 13, color: colors.textFaint, marginBottom: 16 },
  form: { gap: 14 },
  forgotBtn: { alignSelf: 'flex-end' },
  forgotText: { fontSize: 12, color: colors.textFaint },
  resetBox: {
    backgroundColor: colors.blueBg, borderRadius: 12,
    borderWidth: 1, borderColor: colors.blueBorder, padding: 14, gap: 8,
  },
  resetTitle: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  resetDesc: { fontSize: 12, color: colors.textFaint },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  footerText: { fontSize: 13, color: colors.textFaint },
  link: { fontSize: 13, color: colors.blue, fontWeight: '700' },
  gameTease: {
    marginTop: 20, padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: colors.blueBorder, backgroundColor: colors.blueBg,
  },
  gameTeaseText: { fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
