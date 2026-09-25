import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HabitStoreProvider, useHabitStore } from './src/state/HabitStore';
import { PurchasesProvider, usePurchases } from './src/state/PurchasesProvider';
import { PaywallProvider, usePaywall } from './src/state/PaywallProvider';
import { analytics, sessionSink } from './src/services/analytics';

// In-session funnel. Swap sessionSink for a RevenueCat / PostHog forwarder in production.
analytics.addSink(sessionSink);
import { HabitsScreen } from './src/screens/HabitsScreen';
import { CoachScreen } from './src/screens/CoachScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: theme.colors.bg, card: theme.colors.surface, text: theme.colors.text, border: theme.colors.border, primary: theme.colors.primary }
};

function tabIcon(emoji: string) {
  return ({ focused }: { focused: boolean }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

function Tabs() {
  const { open } = usePaywall();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted
      }}
    >
      <Tab.Screen name="Today" options={{ tabBarIcon: tabIcon('📋') }}>
        {() => <HabitsScreen onUpgrade={() => open('habit_limit')} />}
      </Tab.Screen>
      <Tab.Screen name="Coach" options={{ tabBarIcon: tabIcon('🧠') }}>
        {() => <CoachScreen onUpgrade={() => open('coach_lock')} />}
      </Tab.Screen>
      <Tab.Screen name="Settings" options={{ tabBarIcon: tabIcon('⚙️') }}>
        {() => <SettingsScreen onUpgrade={() => open('settings')} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function DemoStoreBanner() {
  const { mock } = usePurchases();
  if (!mock) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>Sandbox / Demo store — purchases are simulated until RevenueCat SDK keys are set.</Text>
    </View>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const { ready } = usePurchases();
  const { loaded } = useHabitStore();
  if (!ready || !loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={styles.loadingText}>HabitFlow Pro</Text>
      </View>
    );
  }
  return <>{children}</>;
}

export default function App() {
  React.useEffect(() => {
    analytics.track({ name: 'app_opened' });
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <HabitStoreProvider>
        <PurchasesProvider>
          <PaywallProvider>
            <NavigationContainer theme={navTheme}>
              <Gate>
                <DemoStoreBanner />
                <Tabs />
              </Gate>
            </NavigationContainer>
          </PaywallProvider>
        </PurchasesProvider>
      </HabitStoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  banner: { backgroundColor: '#3f2e12', paddingVertical: 8, paddingHorizontal: 16 },
  bannerText: { color: '#f6d58a', fontSize: 13, fontWeight: '700', textAlign: 'center' }
});
