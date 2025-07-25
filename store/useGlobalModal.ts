import { ReactNode } from "react"
import { create } from "zustand"

interface GlobalModalState {
  isOpen: boolean
  title?: string
  content?: ReactNode
  className?: string
  onClose?: () => void
  openModal: (params: { title?: string; content: ReactNode; onClose?: () => void }) => void
  closeModal: () => void
}

export const useGlobalModal = create<GlobalModalState>((set) => ({
  isOpen: false,
  title: undefined,
  content: null,
  onClose: undefined,
  className: "",
  openModal: ({ title, content, onClose }) =>
    set({ isOpen: true, title, content, onClose }),
  closeModal: () =>
    set((state) => {
      state.onClose?.()
      return {
        isOpen: false,
        title: undefined,
        content: null,
        onClose: undefined,
        className: "",
      }
    }),
}))
