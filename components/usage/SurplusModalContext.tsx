'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { SurplusPacksModal } from './SurplusPacksModal';

const SurplusModalContext = createContext<{ openSurplusModal: () => void } | null>(null);

export function SurplusModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSurplusModal = useCallback(() => setOpen(true), []);
  const closeSurplusModal = useCallback(() => setOpen(false), []);

  return (
    <SurplusModalContext.Provider value={{ openSurplusModal }}>
      {children}
      <SurplusPacksModal open={open} onClose={closeSurplusModal} />
    </SurplusModalContext.Provider>
  );
}

export function useSurplusModal() {
  const ctx = useContext(SurplusModalContext);
  return ctx?.openSurplusModal ?? (() => window.location.href = '/usage');
}
