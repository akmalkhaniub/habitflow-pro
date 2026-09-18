import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { usePurchases } from '../state/PurchasesProvider';
import { theme } from '../theme';

export function SettingsScreen({ onUpgrade }: { onUpgrade: () => void }) {
  const { isPro, mock, restore } = usePurchases();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Subscription</Text>
        <Text style={styles.value}>{isPro ? 'HabitFlow Pro — active 👑' : 'Free plan'}</Text>
        {!isPro ? (
          <Pressable style={styles.cta} onPress={onUpgrade}>
            <Text style={styles.ctaText}>Upgrade to Pro</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={styles.secondary}
          onPress={async () => {
            const ok = await restore();
            Alert.alert(ok ? 'Restored' : 'Nothing to restore', ok ? 'Pro access is active.' : 'No previous purchases found.');
          }}
        >
          <Text style={styles.secondaryText}>Restore purchases</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Billing engine</Text>
        <Text style={styles.value}>{mock ? 'Simulated store (no RevenueCat key configured)' : 'RevenueCat (live)'}</Text>
        <Text style={styles.hint}>
          Set your RevenueCat public SDK keys in app.json (`extra.revenueCatIosKey` / `revenueCatAndroidKey`) and rebuild to enable live in-app purchases.
        </Text>
      </View>

      <Text style={styles.footer}>HabitFlow Pro • RevenueCat Shipaton 2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(2), paddingBottom: theme.spacing(6) },
  h1: { color: theme.colors.text, fontSize: 32, fontWeight: '800', marginBottom: theme.spacing(2) },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing(2), marginBottom: theme.spacing(1.5), borderWidth: 1, borderColor: theme.colors.border },
  label: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  value: { color: theme.colors.text, fontSize: 17, fontWeight: '700', marginTop: 6 },
  hint: { color: theme.colors.textMuted, fontSize: 12, marginTop: theme.spacing(1), lineHeight: 18 },
  cta: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingVertical: theme.spacing(1.25), alignItems: 'center', marginTop: theme.spacing(1.5) },
  ctaText: { color: theme.colors.primaryText, fontWeight: '800' },
  secondary: { paddingVertical: theme.spacing(1.25), alignItems: 'center', marginTop: theme.spacing(0.5) },
  secondaryText: { color: theme.colors.primary, fontWeight: '700' },
  footer: { color: theme.colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: theme.spacing(2) }
});
