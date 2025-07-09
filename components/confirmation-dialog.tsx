import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useConfirmationStore from "@/store/confirmation";

// interface AlertDialogProps {
//   children: ReactNode; // This will be the trigger button or element
//   title: string;
//   description: string;
//   cancelText?: string;
//   actionText: string;
//   onAction: () => void;
// }

export default function ConfirmationDialog() {
  const { open,title, description, cancelLabel, actionLabel, onAction , CloseConfirmation} = useConfirmationStore();

  return (
    <AlertDialog onOpenChange={CloseConfirmation} open={open} >  
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
       
          >{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}
          className={actionLabel?.toLowerCase() === "delete" ? "bg-red-600 hover:bg-red-400 " : ""}
          >{actionLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}