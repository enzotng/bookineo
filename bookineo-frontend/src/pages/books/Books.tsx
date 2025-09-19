import React, { useState, useEffect } from "react";
import { booksAPI } from "../../api/books";
import type { Book, Category, BookFilters, PaginationInfo } from "../../types/book";
import {
    Button,
    Badge,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    Skeleton,
    Spinner,
} from "../../components/ui";
import { BookCard } from "../../components/books";
import { FilterPanel } from "../../components/filters";
import { PageHeader } from "../../components/layout";
import type { FilterConfig } from "../../components/filters";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, BookOpen, Clock, Download } from "lucide-react";
const Books: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<BookFilters>({ page: 1, limit: 12 });
    const [uiFilters, setUiFilters] = useState<Record<string, any>>({});

    const loadBooksAndCategories = async (currentFilters?: BookFilters) => {
        try {
            setLoading(true);
            setError(null);

            const { booksResponse, categories: fetchedCategories } = await booksAPI.getBooksAndCategories(currentFilters);

            setBooks(booksResponse.books);
            setPagination(booksResponse.pagination);
            setCategories(fetchedCategories);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBooksAndCategories(filters);
    }, []);

    const handleFiltersChange = (newUiFilters: Record<string, any>) => {
        setUiFilters(newUiFilters);
        const newFilters = {
            ...filters,
            title: newUiFilters.title || undefined,
            author: newUiFilters.author || undefined,
            category_id: newUiFilters.category_id ? parseInt(newUiFilters.category_id) : undefined,
            status: newUiFilters.status || undefined,
            page: 1,
        };
        setFilters(newFilters);
        loadBooksAndCategories(newFilters);
    };

    const clearFilters = () => {
        const resetFilters = { page: 1, limit: 12 };
        setFilters(resetFilters);
        setUiFilters({});
        loadBooksAndCategories(resetFilters);
    };

    const handlePageChange = (newPage: number) => {
        const newFilters = { ...filters, page: newPage };
        setFilters(newFilters);
        loadBooksAndCategories(newFilters);
    };


    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "Non catégorisé";
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || "Non catégorisé";
    };

    const exportToCsv = () => {
        const headers = ["Titre", "Auteur", "ISBN", "Catégorie", "Prix (€)", "Statut", "Propriétaire", "Année de publication", "Description"];

        const csvData = books.map((book) => [
            book.title || "",
            book.author || "",
            book.isbn || "",
            getCategoryName(book.category_id),
            book.price || "",
            book.status === "available" ? "Disponible" : book.status === "rented" ? "Loué" : "Indisponible",
            `${book.first_name || ""} ${book.last_name || ""}`.trim() || "Propriétaire inconnu",
            book.publication_year || "",
            book.description || "",
        ]);

        const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `catalogue-livres-${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Export CSV généré avec ${books.length} livre${books.length > 1 ? "s" : ""}`);
    };

    const getStatusBadgeVariant = (status: Book["status"]) => {
        switch (status) {
            case "available":
                return "default";
            case "rented":
                return "destructive";
            case "unavailable":
                return "secondary";
            default:
                return "outline";
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

    const filterConfigs: FilterConfig[] = [
        {
            key: "title",
            type: "search",
            label: "Titre",
            icon: Search,
            placeholder: "Rechercher par titre...",
        },
        {
            key: "author",
            type: "text",
            label: "Auteur",
            icon: BookOpen,
            placeholder: "Rechercher par auteur...",
        },
        {
            key: "category_id",
            type: "select",
            label: "Catégorie",
            icon: Clock,
            placeholder: "Toutes les catégories",
            options: [{ value: "all", label: "Toutes les catégories" }, ...categories.map((cat) => ({ value: cat.id.toString(), label: cat.name }))],
        },
        {
            key: "status",
            type: "select",
            label: "Statut",
            placeholder: "Tous les statuts",
            options: [
                { value: "all", label: "Tous les statuts" },
                { value: "available", label: "Disponible", icon: <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> },
                { value: "rented", label: "Loué", icon: <div className="w-2 h-2 bg-red-500 rounded-full"></div> },
                { value: "unavailable", label: "Indisponible", icon: <div className="w-2 h-2 bg-gray-500 rounded-full"></div> },
            ],
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-4rem)]">
                <Spinner size="md" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="text-red-500 mb-4">Erreur: {error}</div>
                    <Button onClick={() => loadBooksAndCategories(filters)}>Réessayer</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto rounded-lg">
            <PageHeader
                title="Catalogue des livres"
                subtitle="Découvrez et louez des livres"
                icon={BookOpen}
                actions={
                    <Button onClick={exportToCsv} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all" disabled={books.length === 0}>
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">Exporter CSV</span>
                    </Button>
                }
            />

            <FilterPanel
                title="Filtres et recherche"
                subtitle="Trouvez le livre parfait"
                filters={uiFilters}
                onFiltersChange={handleFiltersChange}
                filterConfigs={filterConfigs}
                onClearFilters={clearFilters}
            />

            <div className="text-sm text-gray-600 font-bold">
                {pagination ? (
                    <>
                        {pagination.totalBooks} livre{pagination.totalBooks > 1 ? "s" : ""} trouvé{pagination.totalBooks > 1 ? "s" : ""}
                        {pagination.totalPages > 1 && (
                            <span>
                                {" "}
                                - Page {pagination.currentPage} sur {pagination.totalPages}
                            </span>
                        )}
                    </>
                ) : (
                    `${books.length} livre${books.length > 1 ? "s" : ""} trouvé${books.length > 1 ? "s" : ""}`
                )}
            </div>

            {books.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">Aucun livre trouvé</div>
                    <Button variant="outline" onClick={clearFilters}>
                        Afficher tous les livres
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {books.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            getCategoryName={getCategoryName}
                            onBookClick={(book) => navigate(`/books/${book.id}`)}
                            showActions={true}
                            onRentalSuccess={() => loadBooksAndCategories(filters)}
                        />
                    ))}
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <div className="mt-8">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => pagination.hasPreviousPage && handlePageChange(pagination.currentPage - 1)}
                                    className={!pagination.hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {pagination.totalPages <= 7 ? (
                                Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink onClick={() => handlePageChange(pageNumber)} isActive={pageNumber === pagination.currentPage} className="cursor-pointer">
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))
                            ) : (
                                <>
                                    <PaginationItem>
                                        <PaginationLink onClick={() => handlePageChange(1)} isActive={pagination.currentPage === 1} className="cursor-pointer">
                                            1
                                        </PaginationLink>
                                    </PaginationItem>

                                    {pagination.currentPage > 3 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}

                                    {Array.from({ length: 3 }, (_, i) => {
                                        const pageNumber = pagination.currentPage - 1 + i;
                                        if (pageNumber > 1 && pageNumber < pagination.totalPages) {
                                            return (
                                                <PaginationItem key={pageNumber}>
                                                    <PaginationLink onClick={() => handlePageChange(pageNumber)} isActive={pageNumber === pagination.currentPage} className="cursor-pointer">
                                                        {pageNumber}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            );
                                        }
                                        return null;
                                    })}

                                    {pagination.currentPage < pagination.totalPages - 2 && (
                                        <PaginationItem>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )}

                                    <PaginationItem>
                                        <PaginationLink onClick={() => handlePageChange(pagination.totalPages)} isActive={pagination.currentPage === pagination.totalPages} className="cursor-pointer">
                                            {pagination.totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => pagination.hasNextPage && handlePageChange(pagination.currentPage + 1)}
                                    className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default Books;
