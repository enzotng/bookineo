import React from "react";
import { Badge, Button } from "../../../components/ui";
import { X, Calendar, Tag, Euro, User } from "lucide-react";
import type { Book, Category } from "../../../types/book";

interface BookDetailsProps {
    book: Book;
    categories: Category[];
    onClose: () => void;
}

const BookDetails: React.FC<BookDetailsProps> = ({ book, categories, onClose }) => {
    const getStatusBadgeVariant = (status: Book["status"]) => {
        const variants = {
            available: "default",
            rented: "secondary",
            unavailable: "destructive"
        };
        return variants[status] || "outline";
    };

    const getStatusText = (status: Book["status"]) => {
        const texts = {
            available: "Disponible",
            rented: "Loué",
            unavailable: "Indisponible"
        };
        return texts[status] || status;
    };

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "Non catégorisé";
        return categories.find(c => c.id === categoryId)?.name || "Non catégorisé";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{book.title}</h2>
                    <p className="text-gray-600 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        par {book.author}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={onClose} className="ml-4">
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {book.image_url && (
                <div className="aspect-[3/4] max-w-48 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                    <img
                        src={book.image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-1">Statut</h3>
                        <Badge variant={getStatusBadgeVariant(book.status)}>
                            {getStatusText(book.status)}
                        </Badge>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Euro className="w-4 h-4" />
                            Prix
                        </h3>
                        <p className="text-lg font-semibold text-gray-700">{book.price}€</p>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Catégorie
                        </h3>
                        <p className="text-gray-700">{getCategoryName(book.category_id)}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {book.isbn && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-1">ISBN</h3>
                            <p className="text-gray-700 font-mono text-sm">{book.isbn}</p>
                        </div>
                    )}

                    {book.publication_year && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Année
                            </h3>
                            <p className="text-gray-700">{book.publication_year}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="font-medium text-gray-900 mb-1">Ajouté le</h3>
                        <p className="text-gray-700 text-sm">{formatDate(book.created_at)}</p>
                    </div>

                    {book.updated_at !== book.created_at && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-1">Modifié le</h3>
                            <p className="text-gray-700 text-sm">{formatDate(book.updated_at)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookDetails;