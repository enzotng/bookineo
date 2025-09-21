import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, Badge, Spinner, Button, DataTable, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../components/ui";
import { BookOpen, TrendingUp, Users, Star, Sparkles, Crown, Compass, Grid3X3, List, Plus, MoreHorizontal, Eye, Edit, Trash2, Download } from "lucide-react";
import { BookCard, BookDetailModal } from "../components/books";
import { PageHeader } from "../components/layout";
import { booksAPI } from "../api/books";
import type { Book } from "../types/book";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleBookDetail = (book: Book) => {
        setSelectedBook(book);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBook(null);
    };

    const columns: ColumnDef<Book>[] = useMemo(
        () => [
            {
                accessorKey: "title",
                header: "Titre",
                cell: ({ row }) => <div className="font-medium text-gray-900 max-w-[200px] truncate">{row.getValue("title")}</div>,
            },
            {
                accessorKey: "author",
                header: "Auteur",
                cell: ({ row }) => <div className="text-gray-600 max-w-[150px] truncate">{row.getValue("author")}</div>,
            },
            {
                accessorKey: "publication_year",
                header: "Année",
                cell: ({ row }) => <div className="text-gray-600">{row.getValue("publication_year") || "--"}</div>,
            },
            {
                accessorKey: "category_id",
                header: "Catégorie",
                cell: ({ row }) => <div className="text-gray-600">{getCategoryName(row.getValue("category_id"))}</div>,
            },
            {
                accessorKey: "status",
                header: "Statut",
                cell: ({ row }) => (
                    <Badge className={row.getValue("status") === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>{getStatusText(row.getValue("status"))}</Badge>
                ),
            },
            {
                accessorKey: "price",
                header: "Prix",
                cell: ({ row }) => <div className="font-semibold text-blue-600">{row.getValue("price")}€</div>,
            },
            {
                id: "owner",
                header: "Propriétaire",
                cell: ({ row }) => <div className="text-gray-600 max-w-[120px] truncate">{`${row.original.first_name || ""} ${row.original.last_name || ""}`.trim() || "Non défini"}</div>,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleBookDetail(row.original)} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [categories, navigate, handleBookDetail]
    );

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                setLoading(true);
                const { booksResponse, categories: fetchedCategories } = await booksAPI.getBooksAndCategories({
                    limit: 50,
                });
                setBooks(booksResponse.books);
                setCategories(fetchedCategories);
            } catch (error) {
                console.error("Erreur lors du chargement:", error);
            } finally {
                setLoading(false);
            }
        };
        loadHomeData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Spinner size="md" />
            </div>
        );
    }

    const newBooks = books.slice(0, 5);
    const popularBooks = books.slice(5, 10);
    const discoveryBooks = books.slice(10, 15);

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "Non catégorisé";
        return categories.find((c) => c.id === categoryId)?.name || "Non catégorisé";
    };

    const getStatusText = (status: string) => {
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

    const exportToCSV = () => {
        const headers = ["Titre", "Auteur", "Année", "Catégorie", "Statut", "Prix", "Propriétaire"];
        const csvContent = [
            headers.join(","),
            ...books.map(book => [
                `"${book.title || ""}"`,
                `"${book.author || ""}"`,
                book.publication_year || "",
                `"${getCategoryName(book.category_id)}"`,
                `"${getStatusText(book.status)}"`,
                `${book.price || 0}`,
                `"${`${book.first_name || ""} ${book.last_name || ""}`.trim() || "Non défini"}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `livres_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const BookSection = ({ books, title, subtitle, gradientColor, icon: Icon }: { books: Book[]; title: string; subtitle: string; gradientColor: string; icon: any }) => (
        <div className="w-full flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${gradientColor} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-foreground">{title}</h2>
                    <div className="text-sm text-muted-foreground">{subtitle}</div>
                </div>
            </div>

            <div>
                {viewMode === "cards" ? (
                    <div className="rounded-2xl border border-baby-powder-700/50 backdrop-blur-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                            {books.map((book) => (
                                <BookCard key={book.id} book={book} onBookClick={() => handleBookDetail(book)} showActions={true} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <div className="rounded-xl border border-gray-200 overflow-x-auto">
                            <DataTable columns={columns} data={books} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col gap-8 lg:gap-10">
            <PageHeader
                title="Catalogue des livres"
                subtitle="Découvrez notre collection de livres disponibles"
                icon={BookOpen}
                badge={{
                    text: `${books.length} livres`,
                    className: "bg-blue-100 text-blue-800 border-blue-300"
                }}
                actions={
                    <>
                        <Button size="sm" onClick={exportToCSV} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all font-semibold">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Exporter CSV</span>
                        </Button>
                        <Button size="sm" onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all font-semibold">
                            {viewMode === "cards" ? (
                                <>
                                    <List className="w-4 h-4" />
                                    <span className="hidden sm:inline">Vue liste</span>
                                </>
                            ) : (
                                <>
                                    <Grid3X3 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Vue cartes</span>
                                </>
                            )}
                        </Button>
                    </>
                }
            />

            <BookSection books={newBooks} title="Nouveautés" subtitle="Les derniers arrivages de la semaine" gradientColor="from-blue-500 to-purple-600" icon={Sparkles} />

            <BookSection books={popularBooks} title="Coups de cœur" subtitle="Les préférés de notre communauté" gradientColor="from-purple-500 to-blue-600" icon={Crown} />

            <BookSection books={discoveryBooks} title="À découvrir" subtitle="Explorez de nouveaux horizons littéraires" gradientColor="from-blue-600 to-purple-500" icon={Compass} />

            <BookDetailModal book={selectedBook} categories={categories} isOpen={isModalOpen} onClose={handleCloseModal} />
        </div>
    );
};

export default Home;
