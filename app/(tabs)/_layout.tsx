import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconActive]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.blue,
      tabBarInactiveTintColor: colors.textFaint,
      tabBarLabelStyle: styles.label,
      tabBarShowLabel: true,
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Início',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
      }} />
      <Tabs.Screen name="transactions" options={{
        title: 'Transações',
        tabBarIcon: ({ focused }) => <TabIcon emoji="💸" focused={focused} />,
      }} />
      <Tabs.Screen name="goals" options={{
        title: 'Objetivos',
        tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" focused={focused} />,
      }} />
      <Tabs.Screen name="stocks" options={{
        title: 'Carteira',
        tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} />,
      }} />
      <Tabs.Screen name="fixed" options={{
        title: 'Fixos',
        tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Perfil',
        tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingBottom: 6,
    paddingTop: 6,
    height: 62,
  },
  iconWrap: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  iconActive: { backgroundColor: colors.blueBg },
  emoji: { fontSize: 18 },
  label: { fontSize: 10, fontWeight: '600' },
});
