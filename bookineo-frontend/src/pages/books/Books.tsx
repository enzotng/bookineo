import React, { useState, useEffect, useMemo } from "react";
import { booksAPI } from "../../api/books";
import type { Book, Category, BookFilters, PaginationInfo } from "../../types/book";
import { Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Card, CardContent, CardHeader, CardTitle, Input, Label, Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, Skeleton, Spinner } from "../../components/ui";
const Books: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<BookFilters>({ page: 1, limit: 12 });
    const [searchTitle, setSearchTitle] = useState("");
    const [searchAuthor, setSearchAuthor] = useState("");

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

    const handleFilterChange = (key: keyof BookFilters, value: string | number | undefined) => {
        const newFilters = { ...filters, [key]: value, page: 1 };
        setFilters(newFilters);
        loadBooksAndCategories(newFilters);
    };

    const handleSearch = () => {
        const searchFilters = {
            ...filters,
            title: searchTitle || undefined,
            author: searchAuthor || undefined,
            page: 1,
        };
        setFilters(searchFilters);
        loadBooksAndCategories(searchFilters);
    };

    const clearFilters = () => {
        const resetFilters = { page: 1, limit: 12 };
        setFilters(resetFilters);
        setSearchTitle("");
        setSearchAuthor("");
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

    const getStatusBadgeVariant = (status: Book["status"]) => {
        switch (status) {
            case "available":
                return "default";
            case "rented":
                return "secondary";
            case "unavailable":
                return "destructive";
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


    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-5rem)] gap-4">
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
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-6">Catalogue des livres</h1>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filtres et recherche</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <Label htmlFor="title-search">Titre</Label>
                                <Input id="title-search" placeholder="Rechercher par titre..." value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="author-search">Auteur</Label>
                                <Input id="author-search" placeholder="Rechercher par auteur..." value={searchAuthor} onChange={(e) => setSearchAuthor(e.target.value)} />
                            </div>

                            <div>
                                <Label htmlFor="category-filter">Catégorie</Label>
                                <Select value={filters.category_id?.toString() || "all"} onValueChange={(value) => handleFilterChange("category_id", value === "all" ? undefined : parseInt(value))}>
                                    <SelectTrigger id="category-filter">
                                        <SelectValue placeholder="Toutes les catégories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les catégories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="status-filter">Statut</Label>
                                <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value === "all" ? undefined : value)}>
                                    <SelectTrigger id="status-filter">
                                        <SelectValue placeholder="Tous les statuts" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="available">Disponible</SelectItem>
                                        <SelectItem value="rented">Loué</SelectItem>
                                        <SelectItem value="unavailable">Indisponible</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleSearch}>Rechercher</Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Effacer les filtres
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mb-4">
                <div className="text-sm text-gray-600">
                    {pagination ? (
                        <>
                            {pagination.totalBooks} livre{pagination.totalBooks > 1 ? "s" : ""} trouvé{pagination.totalBooks > 1 ? "s" : ""}
                            {pagination.totalPages > 1 && (
                                <span> - Page {pagination.currentPage} sur {pagination.totalPages}</span>
                            )}
                        </>
                    ) : (
                        `${books.length} livre${books.length > 1 ? "s" : ""} trouvé${books.length > 1 ? "s" : ""}`
                    )}
                </div>
            </div>

            {books.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">Aucun livre trouvé</div>
                    <Button variant="outline" onClick={clearFilters}>
                        Afficher tous les livres
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <Card key={book.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-4">
                                {book.image_url && (
                                    <div className="aspect-[3/4] bg-gray-100 rounded-md overflow-hidden relative h-56 w-full">
                                        <Skeleton className="absolute inset-0 w-full h-full" />
                                        <img
                                            src={book.image_url}
                                            alt={book.title}
                                            className="w-full h-full object-cover relative z-10"
                                            loading="lazy"
                                            onLoad={(e) => {
                                                const skeleton = e.currentTarget.previousElementSibling;
                                                if (skeleton) skeleton.style.display = "none";
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                                const skeleton = e.currentTarget.previousElementSibling;
                                                if (skeleton) skeleton.style.display = "none";
                                            }}
                                        />
                                    </div>
                                )}
                                <CardTitle className="text-lg line-clamp-2" title={book.title}>
                                    {book.title}
                                </CardTitle>
                                <div className="text-sm text-gray-600">par {book.author}</div>
                                {book.publication_year && <div className="text-sm text-gray-500">{book.publication_year}</div>}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Badge variant={getStatusBadgeVariant(book.status)}>{getStatusText(book.status)}</Badge>
                                        <div className="font-semibold text-lg">{book.price}€</div>
                                    </div>

                                    <div className="text-sm text-gray-600">{getCategoryName(book.category_id)}</div>

                                    <Button className="w-full mt-4" variant={book.status === "available" ? "default" : "secondary"} disabled={book.status !== "available"}>
                                        {book.status === "available" ? "Louer" : "Indisponible"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
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
                                        <PaginationLink
                                            onClick={() => handlePageChange(pageNumber)}
                                            isActive={pageNumber === pagination.currentPage}
                                            className="cursor-pointer"
                                        >
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))
                            ) : (
                                <>
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() => handlePageChange(1)}
                                            isActive={pagination.currentPage === 1}
                                            className="cursor-pointer"
                                        >
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
                                                    <PaginationLink
                                                        onClick={() => handlePageChange(pageNumber)}
                                                        isActive={pageNumber === pagination.currentPage}
                                                        className="cursor-pointer"
                                                    >
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
                                        <PaginationLink
                                            onClick={() => handlePageChange(pagination.totalPages)}
                                            isActive={pagination.currentPage === pagination.totalPages}
                                            className="cursor-pointer"
                                        >
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
