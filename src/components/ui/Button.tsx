import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/theme/colors';

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ onPress, children, variant = 'primary', size = 'md', loading, disabled, style }: ButtonProps) {
  const btnStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}` as keyof typeof styles],
    (disabled || loading) && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity style={btnStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.75}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : colors.blue} />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}` as keyof typeof styles], styles[`textSize_${size}` as keyof typeof styles]]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primary: { backgroundColor: colors.blue },
  secondary: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  ghost: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  size_sm: { paddingHorizontal: 14, paddingVertical: 8 },
  size_md: { paddingHorizontal: 18, paddingVertical: 12 },
  size_lg: { paddingHorizontal: 22, paddingVertical: 16, borderRadius: 14 },
  text: { fontWeight: '600' },
  text_primary: { color: '#fff' },
  text_secondary: { color: colors.textMuted },
  text_danger: { color: colors.red },
  text_ghost: { color: colors.blue },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 16 },
});
