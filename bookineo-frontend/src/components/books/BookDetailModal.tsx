import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Badge,
    Button,
    Avatar,
    AvatarFallback,
} from "../ui";
import { ContactOwnerButton } from "../messaging/ContactOwnerButton";
import { useRentalCart } from "../../contexts/RentalCartContext";
import { useNavigate } from "react-router-dom";
import { X, Calendar, Tag, Euro, User, BookOpen, ShoppingCart, Check, Zap } from "lucide-react";
import type { Book } from "../../types/book";

interface BookDetailModalProps {
    book: Book | null;
    categories: any[];
    isOpen: boolean;
    onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
    book,
    categories,
    isOpen,
    onClose
}) => {
    const { addToCart, isBookInCart } = useRentalCart();
    const navigate = useNavigate();

    if (!book) return null;

    const getStatusBadgeVariant = (status: Book["status"]) => {
        const variants = {
            available: "default",
            rented: "secondary",
            unavailable: "destructive",
        };
        return variants[status] || "outline";
    };

    const getStatusText = (status: Book["status"]) => {
        const texts = {
            available: "Disponible",
            rented: "Loué",
            unavailable: "Indisponible",
        };
        return texts[status] || status;
    };

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "Non catégorisé";
        return categories.find((c) => c.id === categoryId)?.name || "Non catégorisé";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleAddToCart = () => {
        addToCart(book);
    };

    const handleRentDirect = () => {
        onClose();
        navigate(`/rent/${book.id}`);
    };

    const getOwnerInitials = () => {
        const firstName = book.first_name || "";
        const lastName = book.last_name || "";
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
    };

    const getOwnerName = () => {
        const firstName = book.first_name || "";
        const lastName = book.last_name || "";
        return `${firstName} ${lastName}`.trim() || "Utilisateur";
    };

    const inCart = isBookInCart(book.id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <div className="flex justify-between items-start">
                        <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
                            {book.title}
                        </DialogTitle>
                    </div>
                    <p className="text-gray-600 flex items-center gap-2 text-left">
                        <User className="w-4 h-4" />
                        par {book.author}
                    </p>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex gap-6">
                        <div className="w-48 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                            {book.image_url ? (
                                <img
                                    src={book.image_url}
                                    alt={book.title}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-2 mx-auto">
                                        <BookOpen className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-sm text-gray-700 font-medium text-center px-2">
                                        {book.title}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Statut</h3>
                                    <Badge
                                        className={book.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                                    >
                                        {getStatusText(book.status)}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <Euro className="w-4 h-4" />
                                        Prix par jour
                                    </h3>
                                    <p className="text-2xl font-bold text-blue-600">{book.price}€</p>
                                </div>

                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Catégorie
                                    </h3>
                                    <p className="text-gray-700">{getCategoryName(book.category_id)}</p>
                                </div>

                                {book.publication_year && (
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Année
                                        </h3>
                                        <p className="text-gray-700">{book.publication_year}</p>
                                    </div>
                                )}
                            </div>

                            {book.description && (
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        {book.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="text-black font-bold border border-gray-200">
                                        {getOwnerInitials()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-gray-900">{getOwnerName()}</p>
                                    <p className="text-sm text-gray-500">Propriétaire</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <ContactOwnerButton bookId={book.id} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {book.status === "available" && (
                                <>
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={inCart}
                                        variant={inCart ? "outline" : "outline"}
                                        className={`flex-1 ${
                                            inCart
                                                ? "bg-green-50 text-green-800 border-green-200 hover:bg-green-50"
                                                : "hover:bg-blue-50 hover:text-blue-700"
                                        }`}
                                    >
                                        {inCart ? (
                                            <>
                                                <Check className="w-4 h-4 mr-2" />
                                                Dans le panier
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Ajouter au panier
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleRentDirect}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                                    >
                                        <Zap className="w-4 h-4 mr-2" />
                                        Louer maintenant
                                    </Button>
                                </>
                            )}

                            {book.status === "rented" && (
                                <div className="flex-1 text-center">
                                    <Badge className="bg-red-100 text-red-800">
                                        Actuellement loué
                                    </Badge>
                                </div>
                            )}

                            {book.status === "unavailable" && (
                                <div className="flex-1 text-center">
                                    <Badge className="bg-gray-100 text-gray-800">
                                        Non disponible
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {book.isbn && (
                        <div className="border-t pt-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-1">ISBN</h3>
                                    <p className="text-gray-700 font-mono">{book.isbn}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-1">Ajouté le</h3>
                                    <p className="text-gray-700">{formatDate(book.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};