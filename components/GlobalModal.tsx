"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useGlobalModal } from "@/store/useGlobalModal"

export const GlobalModal = () => {
  const { isOpen, title, content, closeModal, className } = useGlobalModal()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className={cn("sm:max-w-[500px]",className)}>
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
