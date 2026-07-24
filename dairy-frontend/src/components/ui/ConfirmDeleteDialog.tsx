import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { useTranslation } from "react-i18next";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  title = "Confirm Delete",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
}) => (
  <ConfirmDeleteDialogInner
    open={open}
    onConfirm={onConfirm}
    onCancel={onCancel}
    title={title}
    description={description}
    confirmText={confirmText}
    cancelText={cancelText}
  />
);

const ConfirmDeleteDialogInner: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
  cancelText,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-xs sm:max-w-sm rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{title || t('dialog.confirmDeleteTitle')}</DialogTitle>
        </DialogHeader>
        <div className="py-2 text-sm text-gray-700">{description || t('dialog.confirmDeleteDescription')}</div>
        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={onCancel} className="text-xs sm:text-sm h-8 sm:h-9">{cancelText || t('dialog.cancel')}</Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm h-8 sm:h-9">{confirmText || t('dialog.delete')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
