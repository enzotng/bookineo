import React from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Button } from "../../../components/ui";

interface ConfirmDeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    bookTitle: string;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    bookTitle
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Supprimer le livre</DialogTitle>
                        </div>
                    </div>
                    <DialogDescription className="text-left">
                        Êtes-vous sûr de vouloir supprimer définitivement le livre{" "}
                        <span className="font-semibold">"{bookTitle}"</span> ?
                        <br />
                        <br />
                        Cette action ne peut pas être annulée.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Annuler
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all"
                    >
                        Supprimer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmDeleteDialog;