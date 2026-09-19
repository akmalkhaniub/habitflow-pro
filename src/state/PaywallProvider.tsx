import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal } from 'react-native';
import { PaywallScreen } from '../screens/PaywallScreen';

interface PaywallValue {
  open: (source?: string) => void;
  close: () => void;
}

const PaywallContext = createContext<PaywallValue | null>(null);

export function PaywallProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [source, setSource] = useState('unknown');
  const open = useCallback((src = 'unknown') => { setSource(src); setVisible(true); }, []);
  const close = useCallback(() => setVisible(false), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <PaywallContext.Provider value={value}>
      {children}
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
        <PaywallScreen onClose={close} source={source} />
      </Modal>
    </PaywallContext.Provider>
  );
}

export function usePaywall(): PaywallValue {
  const ctx = useContext(PaywallContext);
  if (!ctx) throw new Error('usePaywall must be used within a PaywallProvider');
  return ctx;
}
