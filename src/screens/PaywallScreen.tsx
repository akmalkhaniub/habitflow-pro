import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { usePurchases } from '../state/PurchasesProvider';
import { analytics } from '../services/analytics';
import { theme } from '../theme';
import type { SimplePackage } from '../services/purchases';

export function PaywallScreen({ onClose, source = 'unknown' }: { onClose: () => void; source?: string }) {
  const { offering, buy, restore, purchasing, mock, isPro } = usePurchases();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    analytics.track({ name: 'paywall_viewed', source });
  }, [source]);

  const pkgs = offering?.packages ?? [];
  const chosen = pkgs.find((p) => p.identifier === selected) ?? pkgs.find((p) => p.period === 'ANNUAL') ?? pkgs[0];

  const onBuy = async () => {
    if (!chosen) return;
    const res = await buy(chosen);
    if (res.status === 'completed' && res.isPro) onClose();
    else if (res.status === 'error') Alert.alert('Purchase failed', res.reason ?? 'Please try again.');
    // status === 'cancelled' → stay quiet; the user chose to back out.
  };

  const onRestore = async () => {
    const ok = await restore();
    Alert.alert(ok ? 'Purchases restored' : 'Nothing to restore', ok ? 'Your Pro access is active.' : 'No previous purchases were found.');
    if (ok) onClose();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <Text style={styles.crown}>👑</Text>
      <Text style={styles.h1}>HabitFlow Pro</Text>
      <Text style={styles.sub}>{offering?.headline ?? 'Unlock your full potential'}</Text>
      {mock ? <Text style={styles.mockBadge}>SANDBOX / SIMULATED STORE</Text> : null}
      {isPro ? <Text style={styles.proBadge}>You already have Pro 🎉</Text> : null}

      <View style={styles.features}>
        {(offering?.features ?? []).map((f) => (
          <View key={f} style={styles.featureRow}>
            <Text style={styles.tick}>✓</Text>
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {pkgs.map((p: SimplePackage) => {
        const isSel = chosen?.identifier === p.identifier;
        return (
          <Pressable key={p.identifier} onPress={() => setSelected(p.identifier)} style={[styles.plan, isSel && styles.planSel]}>
            <View>
              <Text style={styles.planTitle}>{p.title}</Text>
              <Text style={styles.planPeriod}>{p.period}</Text>
            </View>
            <Text style={styles.planPrice}>{p.priceString}</Text>
          </Pressable>
        );
      })}

      <Pressable style={styles.buy} onPress={onBuy} disabled={purchasing || !chosen}>
        {purchasing ? <ActivityIndicator color={theme.colors.primaryText} /> : <Text style={styles.buyText}>{chosen ? `Start ${chosen.title}` : 'Unavailable'}</Text>}
      </Pressable>
      <Pressable onPress={onRestore} style={styles.restore}>
        <Text style={styles.restoreText}>Restore purchases</Text>
      </Pressable>
      <Text style={styles.legal}>Subscriptions auto-renew until canceled. Manage in your store account.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: theme.spacing(3), paddingTop: theme.spacing(6), alignItems: 'stretch' },
  close: { position: 'absolute', top: theme.spacing(3), right: theme.spacing(2), zIndex: 2 },
  closeText: { color: theme.colors.textMuted, fontSize: 22 },
  crown: { fontSize: 44, textAlign: 'center' },
  h1: { color: theme.colors.text, fontSize: 30, fontWeight: '900', textAlign: 'center', marginTop: theme.spacing(1) },
  sub: { color: theme.colors.textMuted, fontSize: 15, textAlign: 'center', marginTop: 4, marginBottom: theme.spacing(2) },
  mockBadge: { alignSelf: 'center', color: theme.colors.warning, borderColor: theme.colors.warning, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, fontSize: 11, fontWeight: '800', marginBottom: theme.spacing(1) },
  proBadge: { alignSelf: 'center', color: theme.colors.success, fontWeight: '800', marginBottom: theme.spacing(1) },
  features: { marginVertical: theme.spacing(2), gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tick: { color: theme.colors.success, fontWeight: '900', fontSize: 16 },
  featureText: { color: theme.colors.text, fontSize: 15, flex: 1 },
  plan: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 2, borderColor: theme.colors.border, padding: theme.spacing(2), marginBottom: theme.spacing(1) },
  planSel: { borderColor: theme.colors.primary },
  planTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  planPeriod: { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  planPrice: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  buy: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, paddingVertical: theme.spacing(2), alignItems: 'center', marginTop: theme.spacing(2) },
  buyText: { color: theme.colors.primaryText, fontWeight: '900', fontSize: 16 },
  restore: { alignItems: 'center', paddingVertical: theme.spacing(1.5) },
  restoreText: { color: theme.colors.primary, fontWeight: '700' },
  legal: { color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: theme.spacing(1) }
});
