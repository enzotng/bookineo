import React, { useState } from "react";
import { Button, Badge } from "../ui";
import { BookOpen, Edit, Trash2 } from "lucide-react";
import { ContactOwnerButton } from "../messaging";
import { useAuth } from "../../hooks/useAuth";
import { rentalsAPI } from "../../api/rentals";
import RentBookModal from "../../pages/books/components/RentBookModal";
import { toast } from "react-toastify";
import type { Book } from "../../types/book";

interface BookCardProps {
    book: Book;
    onBookClick?: (book: Book) => void;
    editAction?: {
        onClick: (book: Book) => void;
    };
    deleteAction?: {
        onClick: (book: Book) => void;
    };
    primaryAction?: {
        label: string;
        onClick: () => void | Promise<void>;
    };
    getCategoryName?: (categoryId?: number) => string;
    overlays?: {
        topRight?: React.ReactNode;
        bottomOverlay?: React.ReactNode;
    };
    customHeight?: string;
    showActions?: boolean;
    onRentalSuccess?: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({
    book,
    onBookClick,
    editAction,
    deleteAction,
    primaryAction,
    getCategoryName,
    overlays,
    showActions = true,
    onRentalSuccess
}) => {
    const { user } = useAuth();
    const [isRentModalOpen, setIsRentModalOpen] = useState(false);
    const handleRentBook = () => {
        if (!user) {
            toast.error("Vous devez être connecté pour louer un livre");
            return;
        }
        setIsRentModalOpen(true);
    };

    const handleRentConfirm = async (rentalData: { rental_date: string; expected_return_date: string }) => {
        if (!user) return;

        try {
            await rentalsAPI.rentBook(
                book.id,
                user.id.toString(),
                rentalData.rental_date,
                rentalData.expected_return_date
            );

            toast.success("Livre loué avec succès !");
            setIsRentModalOpen(false);
            onRentalSuccess?.();
        } catch (error) {
            console.error("Erreur lors de la location:", error);
            toast.error("Erreur lors de la location du livre");
        }
    };

    const getStatusText = (status: Book["status"]) => {
        switch (status) {
            case "available":
                return "Disponible";
            case "rented":
                return "Loué";
            case "unavailable":
                return "Indisponible";
            default:
                return status;
        }
    };

    return (
        <div className="group cursor-pointer h-full">
            <div className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl p-1 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 backdrop-blur-sm border border-white/50 h-full">
                <div className="relative bg-white rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>

                    {overlays?.topRight && (
                        <div className="absolute top-2 right-2 z-20">
                            {overlays.topRight}
                        </div>
                    )}

                    <div className="p-4 flex flex-col h-full">
                        <div className="h-48 min-h-[12rem] mb-4 relative group-hover:scale-[1.02] transition-transform duration-300">
                            {book.image_url && book.image_url.startsWith('http') ? (
                                <div className="relative w-full h-full">
                                    <img src={book.image_url} alt={book.title} className="w-full h-full object-cover rounded-xl shadow-md" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl"></div>
                                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 rounded-xl shadow-md flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-30">
                                        <div
                                            className="w-full h-full"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a78bfa' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                                backgroundRepeat: "repeat",
                                            }}
                                        ></div>
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
                                            <BookOpen className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="text-xs text-gray-700 font-medium text-center px-2 leading-tight line-clamp-2">{book.title}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col h-full">
                            <div className="flex flex-col gap-1 flex-grow">
                                <h3
                                    className={`font-bold text-base leading-tight text-gray-900 line-clamp-2 ${onBookClick ? "cursor-pointer hover:text-blue-600" : ""}`}
                                    onClick={onBookClick ? () => onBookClick(book) : undefined}
                                >
                                    {book.title}
                                </h3>
                                <p className="text-xs text-gray-600 truncate font-medium">{book.author}</p>

                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${book.status === "available" ? "bg-emerald-400" : book.status === "rented" ? "bg-red-400" : "bg-gray-400"} shadow-sm`}></div>
                                        <span className={`text-sm font-medium ${book.status === "available" ? "text-emerald-700" : book.status === "rented" ? "text-red-700" : "text-gray-700"}`}>
                                            {getStatusText(book.status)}
                                        </span>
                                    </div>
                                    <Badge>{book.price}€</Badge>
                                </div>

                                {getCategoryName && <div className="text-sm text-gray-600 truncate mt-1">{getCategoryName(book.category_id)}</div>}
                            </div>

                            <div className="flex flex-col gap-2 mt-auto pt-4">
                                {showActions && (
                                    book.status !== "available" ? (
                                        <ContactOwnerButton
                                            book={book}
                                            ownerName={`${book.first_name || ""} ${book.last_name || ""}`.trim() || "Propriétaire"}
                                            ownerEmail={book.owner_email || "owner@example.com"}
                                            className="w-full"
                                            showAlways={true}
                                        />
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all font-semibold"
                                                onClick={handleRentBook}
                                                size="sm"
                                            >
                                                Louer
                                            </Button>

                                            <ContactOwnerButton
                                                book={book}
                                                ownerName={`${book.first_name || ""} ${book.last_name || ""}`.trim() || "Propriétaire"}
                                                ownerEmail={book.owner_email || "owner@example.com"}
                                                showAlways={true}
                                            />
                                        </div>
                                    )
                                )}

                                <div className="flex gap-2">
                                    {editAction && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all font-medium shadow-sm"
                                            onClick={() => editAction.onClick(book)}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Modifier
                                        </Button>
                                    )}

                                    {deleteAction && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all font-medium shadow-sm"
                                            onClick={() => deleteAction.onClick(book)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Supprimer
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {overlays?.bottomOverlay && (
                            <div className="mt-2">
                                {overlays.bottomOverlay}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <RentBookModal
                book={book}
                isOpen={isRentModalOpen}
                onClose={() => setIsRentModalOpen(false)}
                onConfirm={handleRentConfirm}
            />
        </div>
    );
};
