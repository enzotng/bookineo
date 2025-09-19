import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Badge, Spinner } from "../../components/ui";
import { ArrowLeft, BookOpen, User, Calendar, Tag, MapPin, MessageCircle } from "lucide-react";
import { PageHeader } from "../../components/layout";
import { ContactOwnerButton } from "../../components/messaging";
import { booksAPI } from "../../api/books";
import { rentalsAPI } from "../../api/rentals";
import { useAuth } from "../../hooks/useAuth";
import type { Book, Category } from "../../types/book";
import RentBookModal from "./components/RentBookModal";
import { toast } from "react-toastify";

const BookDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [book, setBook] = useState<Book | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRentModalOpen, setIsRentModalOpen] = useState(false);

    useEffect(() => {
        const loadBookDetails = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const [bookData, categoriesData] = await Promise.all([
                    booksAPI.getBookById(id),
                    booksAPI.getCategories()
                ]);
                setBook(bookData);
                setCategories(categoriesData);
            } catch (error) {
                console.error("Erreur lors du chargement:", error);
                toast.error("Erreur lors du chargement du livre");
            } finally {
                setLoading(false);
            }
        };

        loadBookDetails();
    }, [id]);

    const handleRentBook = async (rentalData: { rental_date: string; expected_return_date: string }) => {
        if (!user || !book) return;

        try {
            await rentalsAPI.rentBook(
                book.id,
                user.id.toString(),
                rentalData.rental_date,
                rentalData.expected_return_date
            );
            toast.success("Livre loué avec succès !");
            setIsRentModalOpen(false);
            navigate("/books/rented");
        } catch (error) {
            console.error("Erreur lors de la location:", error);
            toast.error("Erreur lors de la location du livre");
        }
    };

    const getStatusText = (status: Book["status"]) => {
        switch (status) {
            case "available": return "Disponible";
            case "rented": return "Loué";
            case "unavailable": return "Indisponible";
            default: return status;
        }
    };

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "Non catégorisé";
        return categories.find(c => c.id === categoryId)?.name || "Non catégorisé";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Spinner size="md" />
            </div>
        );
    }

    if (!book) {
        return (
            <div className="w-full h-full flex flex-col gap-4">
                <PageHeader
                    title="Livre non trouvé"
                    subtitle="Ce livre n'existe pas ou a été supprimé"
                    icon={BookOpen}
                />
                <Button onClick={() => navigate("/books")} className="w-fit">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux livres
                </Button>
            </div>
        );
    }

    const isOwner = user && user.id.toString() === book.owner_id.toString();
    const canRent = user && !isOwner && book.status === "available";

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-4 text-gray-600 hover:text-gray-900 w-fit"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                    <div className="sticky top-8">
                        <div className="relative group">
                            <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm">
                                {book.image_url ? (
                                    <img
                                        src={book.image_url}
                                        alt={book.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                                        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-500">
                                            <BookOpen className="w-16 h-16 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 text-center leading-tight">{book.title}</h3>
                                        <p className="text-gray-600 mt-2">{book.author}</p>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -top-2 -right-2">
                                <div className={`px-4 py-2 rounded-full shadow-lg border backdrop-blur-sm ${
                                    book.status === "available" ? "bg-emerald-100/90 text-emerald-800 border-emerald-200" :
                                    book.status === "rented" ? "bg-red-100/90 text-red-800 border-red-200" :
                                    "bg-gray-100/90 text-gray-800 border-gray-200"
                                }`}>
                                    <span className="font-semibold text-sm">{getStatusText(book.status)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <h1 className="text-4xl font-black text-gray-900 leading-tight">{book.title}</h1>
                                </div>
                                <div className="flex items-center gap-3 text-xl text-gray-700 mb-6">
                                    <User className="w-6 h-6 text-blue-500" />
                                    <span className="font-semibold">{book.author}</span>
                                </div>
                                <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    {book.price}€
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <Tag className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-semibold text-gray-700">Catégorie</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{getCategoryName(book.category_id)}</p>
                                </div>

                                {book.isbn && (
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                                <BookOpen className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold text-gray-700">ISBN</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">{book.isbn}</p>
                                    </div>
                                )}

                                {book.publication_year && (
                                    <div className="bg-gradient-to-br from-pink-50 to-blue-50 p-4 rounded-2xl border border-pink-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-blue-600 rounded-lg flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="font-semibold text-gray-700">Année</span>
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">{book.publication_year}</p>
                                    </div>
                                )}
                            </div>

                            {book.description && (
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <MessageCircle className="w-5 h-5 text-blue-500" />
                                        Description
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed text-lg">{book.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Actions</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            {canRent && (
                                <Button
                                    onClick={() => setIsRentModalOpen(true)}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Louer ce livre
                                </Button>
                            )}

                            {!isOwner && (
                                <ContactOwnerButton
                                    book={book}
                                    ownerName="Propriétaire"
                                    ownerEmail="owner@example.com"
                                    className="flex-1"
                                    variant="outline"
                                />
                            )}

                            {isOwner && (
                                <Button
                                    onClick={() => navigate(`/books/my-books`)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Gérer mes livres
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <RentBookModal
                book={book}
                isOpen={isRentModalOpen}
                onClose={() => setIsRentModalOpen(false)}
                onConfirm={handleRentBook}
            />
        </div>
    );
};

export default BookDetails;