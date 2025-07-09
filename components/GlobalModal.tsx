"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGlobalModal } from "@/store/useGlobalModal"

export const GlobalModal = () => {
  const { isOpen, title, content, closeModal } = useGlobalModal()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
