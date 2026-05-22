import { create } from 'zustand';

type Severity = 'success' | 'error';

export type BugReportToastItem = {
  severity: Severity;
  message: string;
};

type State = {
  current: BugReportToastItem | null;
  show: (item: BugReportToastItem) => void;
  dismiss: () => void;
};

export const useBugReportToast = create<State>((set) => ({
  current: null,
  show: (item) => {
    set({ current: item });
    setTimeout(() => {
      set((s) => (s.current === item ? { current: null } : s));
    }, 3000);
  },
  dismiss: () => set({ current: null }),
}));
