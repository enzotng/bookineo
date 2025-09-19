import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Button,
    Label
} from "../../../components/ui";
import type { Book } from "../../../types/book";

const rentalSchema = z.object({
    rental_date: z.string().min(1, "La date de début est requise"),
    expected_return_date: z.string().min(1, "La date de retour est requise"),
}).refine((data) => {
    const rentalDate = new Date(data.rental_date);
    const returnDate = new Date(data.expected_return_date);
    return returnDate > rentalDate;
}, {
    message: "La date de retour doit être après la date de début",
    path: ["expected_return_date"]
});

type RentalFormData = z.infer<typeof rentalSchema>;

interface RentBookModalProps {
    book: Book | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (rentalData: { rental_date: string; expected_return_date: string }) => void;
}

const RentBookModal: React.FC<RentBookModalProps> = ({
    book,
    isOpen,
    onClose,
    onConfirm
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<RentalFormData>({
        resolver: zodResolver(rentalSchema),
        defaultValues: {
            rental_date: new Date().toISOString().split('T')[0],
            expected_return_date: ""
        }
    });

    const onSubmit = (data: RentalFormData) => {
        onConfirm(data);
        reset();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!book) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Louer un livre</DialogTitle>
                    <DialogDescription>
                        Vous êtes sur le point de louer "{book.title}" pour {book.price}€
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="rental_date">Date de début de location *</Label>
                        <input
                            id="rental_date"
                            type="date"
                            {...register("rental_date")}
                            className="w-full px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.rental_date && (
                            <p className="text-red-500 text-sm">{errors.rental_date.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expected_return_date">Date de retour prévue *</Label>
                        <input
                            id="expected_return_date"
                            type="date"
                            {...register("expected_return_date")}
                            className="w-full px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        />
                        {errors.expected_return_date && (
                            <p className="text-red-500 text-sm">{errors.expected_return_date.message}</p>
                        )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md">
                        <div className="text-sm text-blue-800">
                            <div className="font-medium mb-1">Détails de la location :</div>
                            <div>• Livre : {book.title}</div>
                            <div>• Auteur : {book.author}</div>
                            <div>• Prix : {book.price}€</div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                        >
                            {isSubmitting ? "Location..." : "Confirmer la location"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RentBookModal;