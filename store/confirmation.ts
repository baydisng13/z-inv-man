import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";

interface ConfirmationState {
  open: boolean;
  title: string | null;
  description: string | null;
  cancelLabel: string | null;
  actionLabel: string | null;
  onAction: () => void;
  onCancel: () => void;
}

interface confirmationActions {
  OpenConfirmation: (data: {
    title: string;
    description: string;
    cancelLabel: string;
    actionLabel: string;
    onAction: () => void;
    onCancel: () => void;
  }) => void;
  CloseConfirmation: () => void;
}

const useConfirmationStore = create<ConfirmationState & confirmationActions>(
  (set) => ({
    open: false,
    title: null,
    description: null,
    cancelLabel: null,
    actionLabel: null,
    onAction: () => {},
    onCancel: () => {},
    OpenConfirmation: (data) =>
      set((state) => ({
        open: true,
        title: data.title,
        description: data.description,
        cancelLabel: data.cancelLabel,
        actionLabel: data.actionLabel,
        onAction: data.onAction,
        onCancel: data.onCancel,
      })),

    CloseConfirmation: () =>
      set((state) => ({
        open: false,
        title: null,
        description: null,
        cancelLabel: null,
        actionLabel: null,
        onAction: () => {},
        onCancel: () => {},
      })),
  })
);

export default useConfirmationStore;
