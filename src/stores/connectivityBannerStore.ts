import { create } from "zustand";

type RetryFn = (() => void) | (() => Promise<void>);

type ConnectivityBannerState = {
  open: boolean;
  message: string;
  detail?: string;
  lastUpdatedAt: number | null;
  retry?: RetryFn;
  retrying: boolean;

  show: (params: { message: string; detail?: string; retry?: RetryFn }) => void;
  dismiss: () => void;
  retryNow: () => Promise<void>;
};

export const useConnectivityBannerStore = create<ConnectivityBannerState>((set, get) => ({
  open: false,
  message: "",
  detail: undefined,
  lastUpdatedAt: null,
  retry: undefined,
  retrying: false,

  show: ({ message, detail, retry }) =>
    set({
      open: true,
      message,
      detail,
      retry,
      lastUpdatedAt: Date.now(),
      retrying: false,
    }),

  dismiss: () => set({ open: false, retrying: false }),

  retryNow: async () => {
    const fn = get().retry;
    if (!fn) return;

    try {
      set({ retrying: true });
      await fn();
      // If retry succeeds, hide the banner.
      set({ open: false, retrying: false });
    } catch {
      // Keep banner visible; just stop spinner.
      set({ retrying: false });
    }
  },
}));
