import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, hint, prefix, suffix, containerStyle, ...props }: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error ? styles.inputError : undefined]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textFainter}
          selectionColor={colors.blue}
          {...props}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.3 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  inputError: { borderColor: colors.red },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  prefix: { color: colors.textFaint, fontSize: 14 },
  suffix: { color: colors.textFaint, fontSize: 13 },
  errorText: { fontSize: 11, color: colors.red },
  hintText: { fontSize: 11, color: colors.textFaint },
});
