import React, { useState, useEffect } from "react";
import { Plus, Search, BookOpen, Tag } from "lucide-react";
import { Card, CardContent, Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Spinner } from "../../components/ui";
import { booksAPI } from "../../api/books";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { BookCard } from "../../components/books";
import { FilterPanel } from "../../components/filters";
import { PageHeader } from "../../components/layout";
import type { FilterConfig } from "../../components/filters";
import type { Book, Category } from "../../types/book";
import { toast } from "react-toastify";
import BookForm from "./components/BookForm";
import BookDetails from "./components/BookDetails";
import ConfirmDeleteDialog from "./components/ConfirmDeleteDialog";
import BookPagination from "./components/BookPagination";

const MyBooks: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [uiFilters, setUiFilters] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    const ITEMS_PER_PAGE = 12;

    const loadMyBooks = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const searchParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: ITEMS_PER_PAGE.toString(),
                owner_id: user.id.toString(),
            });

            if (uiFilters.title) searchParams.set("title", uiFilters.title);
            if (uiFilters.category_id && uiFilters.category_id !== "all") searchParams.set("category_id", uiFilters.category_id);
            if (uiFilters.status && uiFilters.status !== "all") searchParams.set("status", uiFilters.status);

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books?${searchParams}`);
            if (!response.ok) throw new Error("Erreur lors du chargement des livres");

            const data = await response.json();
            setBooks(data.books || []);
            setTotalPages(data.pagination?.totalPages || 1);
            setTotalBooks(data.pagination?.totalBooks || 0);

            if (categories.length === 0) {
                const categoriesData = await booksAPI.getCategories();
                setCategories(categoriesData);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des livres:", error);
            toast.error("Erreur lors du chargement de vos livres");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyBooks();
    }, [currentPage, uiFilters, user]);

    const handleCreateBook = async (bookData: any) => {
        if (!user) return;
        try {
            await booksAPI.createBook({ ...bookData, owner_id: user.id });
            toast.success("Livre ajouté avec succès !");
            setIsAddModalOpen(false);
            loadMyBooks();
        } catch (error) {
            console.error("Erreur lors de la création:", error);
            toast.error("Erreur lors de l'ajout du livre");
        }
    };

    const handleUpdateBook = async (bookData: any) => {
        if (!selectedBook) return;
        try {
            await booksAPI.updateBook(selectedBook.id, bookData);
            toast.success("Livre modifié avec succès !");
            setIsEditModalOpen(false);
            setSelectedBook(null);
            loadMyBooks();
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            toast.error("Erreur lors de la modification du livre");
        }
    };

    const handleDeleteBook = async () => {
        if (!selectedBook) return;
        try {
            await booksAPI.deleteBook(selectedBook.id);
            toast.success("Livre supprimé avec succès !");
            setIsDeleteModalOpen(false);
            setSelectedBook(null);
            loadMyBooks();
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            toast.error("Erreur lors de la suppression du livre");
        }
    };

    const getStatusBadgeVariant = (status: Book["status"]) => {
        const variants = {
            available: "default",
            rented: "secondary",
            unavailable: "destructive",
        };
        return variants[status] || "outline";
    };

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "Non catégorisé";
        return categories.find((c) => c.id === categoryId)?.name || "Non catégorisé";
    };

    const resetFilters = () => {
        setUiFilters({});
        setCurrentPage(1);
    };

    const handleFiltersChange = (newFilters: Record<string, any>) => {
        setUiFilters(newFilters);
        setCurrentPage(1);
    };

    const filterConfigs: FilterConfig[] = [
        {
            key: "title",
            type: "search",
            label: "Recherche",
            icon: Search,
            placeholder: "Rechercher par titre...",
        },
        {
            key: "category_id",
            type: "select",
            label: "Catégorie",
            icon: Tag,
            placeholder: "Catégorie",
            options: [{ value: "all", label: "Toutes les catégories" }, ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name }))],
        },
        {
            key: "status",
            type: "select",
            label: "Statut",
            icon: BookOpen,
            placeholder: "Statut",
            options: [
                { value: "all", label: "Tous les statuts" },
                { value: "available", label: "Disponible", icon: <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> },
                { value: "rented", label: "Loué", icon: <div className="w-2 h-2 bg-red-500 rounded-full"></div> },
                { value: "unavailable", label: "Indisponible", icon: <div className="w-2 h-2 bg-gray-500 rounded-full"></div> },
            ],
        },
    ];

    if (loading && books.length === 0) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Spinner size="md" />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-4 rounded-lg">
            <PageHeader
                title="Mes livres"
                subtitle={`Gérez votre collection de ${totalBooks} livre${totalBooks !== 1 ? "s" : ""}`}
                icon={BookOpen}
                actions={
                    <Button onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">Ajouter un livre</span>
                    </Button>
                }
            />

            <FilterPanel
                title="Filtres"
                subtitle={`Gérez vos ${totalBooks} livre${totalBooks !== 1 ? "s" : ""}`}
                filters={uiFilters}
                onFiltersChange={handleFiltersChange}
                filterConfigs={filterConfigs}
                onClearFilters={resetFilters}
            />

            {books.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun livre trouvé</h3>
                        <p className="text-gray-600 mb-4">
                            {Object.values(uiFilters).some((v) => v && v !== "all")
                                ? "Aucun livre ne correspond à vos critères de recherche."
                                : "Vous n'avez pas encore ajouté de livres à votre collection."}
                        </p>
                        {!Object.values(uiFilters).some((v) => v && v !== "all") && (
                            <Button onClick={() => setIsAddModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter mon premier livre
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {books.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                getCategoryName={getCategoryName}
                                onBookClick={(book) => navigate(`/books/${book.id}`)}
                                editAction={{
                                    onClick: (book) => {
                                        setSelectedBook(book);
                                        setIsEditModalOpen(true);
                                    },
                                }}
                                deleteAction={{
                                    onClick: (book) => {
                                        setSelectedBook(book);
                                        setIsDeleteModalOpen(true);
                                    },
                                }}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <BookPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </div>
                    )}
                </>
            )}

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouveau livre</DialogTitle>
                        <DialogDescription>Ajoutez un livre à votre collection personnelle.</DialogDescription>
                    </DialogHeader>
                    <BookForm categories={categories} onSubmit={handleCreateBook} onCancel={() => setIsAddModalOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le livre</DialogTitle>
                        <DialogDescription>Modifiez les informations de votre livre.</DialogDescription>
                    </DialogHeader>
                    <BookForm
                        categories={categories}
                        initialData={selectedBook}
                        onSubmit={handleUpdateBook}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setSelectedBook(null);
                        }}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Détails du livre</DialogTitle>
                    </DialogHeader>
                    {selectedBook && (
                        <BookDetails
                            book={selectedBook}
                            categories={categories}
                            onClose={() => {
                                setIsDetailsModalOpen(false);
                                setSelectedBook(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDeleteDialog
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedBook(null);
                }}
                onConfirm={handleDeleteBook}
                bookTitle={selectedBook?.title || ""}
            />
        </div>
    );
};

export default MyBooks;
