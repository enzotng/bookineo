import React, { useState, useEffect, useMemo } from "react";
import { History, Search, Filter, Calendar, User, BookOpen, Download, Clock } from "lucide-react";
import {
    Card,
    CardContent,
    Button,
    Badge,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Spinner,
    Input,
    DataTable
} from "../../components/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { rentalsAPI, type Rental } from "../../api/rentals";
import { booksAPI } from "../../api/books";
import { useAuth } from "../../hooks/useAuth";
import { PageHeader } from "../../components/layout";
import { FilterPanel } from "../../components/filters";
import type { FilterConfig } from "../../components/filters";
import type { Category } from "../../types/book";
import BookPagination from "../books/components/BookPagination";

const RentalHistory: React.FC = () => {
    const { user } = useAuth();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [uiFilters, setUiFilters] = useState<Record<string, any>>({});

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        loadRentalHistory();
        loadCategories();
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [rentals, uiFilters, currentPage]);

    const loadRentalHistory = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await rentalsAPI.getRentalsByUser(user.id.toString());
            setRentals(data);
        } catch (error) {
            console.error("Error loading rental history:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const categoriesData = await booksAPI.getCategories();
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const applyFilters = () => {
        let filtered = [...rentals];

        if (uiFilters.search) {
            filtered = filtered.filter(rental =>
                rental.book_title?.toLowerCase().includes(uiFilters.search.toLowerCase()) ||
                rental.book_author?.toLowerCase().includes(uiFilters.search.toLowerCase())
            );
        }

        if (uiFilters.status && uiFilters.status !== "all") {
            filtered = filtered.filter(rental => rental.status === uiFilters.status);
        }

        if (uiFilters.category && uiFilters.category !== "all") {
            filtered = filtered.filter(rental =>
                rental.category_id && rental.category_id.toString() === uiFilters.category
            );
        }

        if (uiFilters.dateFrom) {
            filtered = filtered.filter(rental =>
                new Date(rental.rental_date) >= new Date(uiFilters.dateFrom)
            );
        }

        if (uiFilters.dateTo) {
            filtered = filtered.filter(rental =>
                new Date(rental.rental_date) <= new Date(uiFilters.dateTo)
            );
        }

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setFilteredRentals(filtered.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString("fr-FR");
        } catch {
            return 'N/A';
        }
    };

    const calculateDuration = (startDate: string, endDate?: string) => {
        try {
            const start = new Date(startDate);
            const end = endDate ? new Date(endDate) : new Date();
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch {
            return 0;
        }
    };

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "Non catégorisé";
        return categories.find(c => c.id === categoryId)?.name || "Non catégorisé";
    };

    const columns: ColumnDef<Rental>[] = useMemo(
        () => [
            {
                accessorKey: "book_title",
                header: "Livre",
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {row.original.book_image_url ? (
                                <img
                                    src={row.original.book_image_url}
                                    alt={row.original.book_title}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <BookOpen className="w-5 h-5 text-blue-500" />
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 max-w-[200px] truncate">{row.getValue("book_title") || "Titre inconnu"}</p>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "book_author",
                header: "Auteur",
                cell: ({ row }) => <div className="text-gray-700 max-w-[150px] truncate">{row.getValue("book_author") || "Auteur inconnu"}</div>,
            },
            {
                accessorKey: "category_id",
                header: "Catégorie",
                cell: ({ row }) => <div className="text-gray-700">{getCategoryName(row.getValue("category_id"))}</div>,
            },
            {
                accessorKey: "rental_date",
                header: "Date location",
                cell: ({ row }) => <div className="text-gray-700">{formatDate(row.getValue("rental_date"))}</div>,
            },
            {
                id: "return_date",
                header: "Date retour",
                cell: ({ row }) => {
                    const isActive = row.original.status === 'active';
                    const date = isActive ? row.original.expected_return_date : row.original.actual_return_date;
                    return <div className="text-gray-700">{formatDate(date)}</div>;
                },
            },
            {
                id: "duration",
                header: "Durée",
                cell: ({ row }) => {
                    const duration = calculateDuration(
                        row.original.rental_date,
                        row.original.actual_return_date || row.original.expected_return_date
                    );
                    return (
                        <div className="flex items-center gap-1 text-gray-700">
                            <Clock className="w-4 h-4" />
                            {duration} jour{duration > 1 ? 's' : ''}
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Statut",
                cell: ({ row }) => {
                    const isActive = row.getValue("status") === 'active';
                    return (
                        <Badge className={`${
                            isActive
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        } shadow-sm`}>
                            {isActive ? 'En cours' : 'Terminé'}
                        </Badge>
                    );
                },
            },
        ],
        [categories, formatDate, calculateDuration, getCategoryName]
    );

    const exportToCsv = () => {
        const headers = [
            "Titre",
            "Auteur",
            "Catégorie",
            "Date de location",
            "Date de retour prévue",
            "Date de retour réelle",
            "Durée (jours)",
            "Statut",
            "Commentaire"
        ];

        const csvData = rentals.map(rental => [
            rental.book_title || '',
            rental.book_author || '',
            getCategoryName(rental.category_id),
            formatDate(rental.rental_date),
            formatDate(rental.expected_return_date),
            formatDate(rental.actual_return_date),
            calculateDuration(rental.rental_date, rental.actual_return_date || rental.expected_return_date),
            rental.status === 'active' ? 'En cours' : 'Terminé',
            rental.comment || ''
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historique-locations-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFiltersChange = (newFilters: Record<string, any>) => {
        setUiFilters(newFilters);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setUiFilters({});
        setCurrentPage(1);
    };

    const filterConfigs: FilterConfig[] = [
        {
            key: 'search',
            type: 'search',
            label: 'Recherche',
            icon: Search,
            placeholder: 'Rechercher par titre ou auteur...'
        },
        {
            key: 'status',
            type: 'select',
            label: 'Statut',
            icon: Filter,
            options: [
                { value: 'all', label: 'Tous les statuts' },
                { value: 'active', label: 'En cours' },
                { value: 'returned', label: 'Terminé' }
            ]
        },
        {
            key: 'category',
            type: 'select',
            label: 'Catégorie',
            icon: BookOpen,
            options: [
                { value: 'all', label: 'Toutes les catégories' },
                ...categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
            ]
        },
        {
            key: 'dateFrom',
            type: 'date',
            label: 'Date début',
            icon: Calendar
        },
        {
            key: 'dateTo',
            type: 'date',
            label: 'Date fin',
            icon: Calendar
        }
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Spinner size="md" />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-4 rounded-lg">
            <PageHeader
                title="Historique des locations"
                subtitle={`${rentals.length} location${rentals.length !== 1 ? 's' : ''} au total`}
                icon={History}
                actions={
                    <Button
                        onClick={exportToCsv}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all"
                        disabled={rentals.length === 0}
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">Exporter CSV</span>
                    </Button>
                }
            />

            <FilterPanel
                title="Filtres"
                subtitle={`Filtrez vos ${rentals.length} location${rentals.length !== 1 ? 's' : ''}`}
                filters={uiFilters}
                onFiltersChange={handleFiltersChange}
                filterConfigs={filterConfigs}
                onClearFilters={resetFilters}
            />

            {filteredRentals.length === 0 ? (
                <Card className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-200">
                    <CardContent className="p-12 text-center">
                        <History className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun historique</h3>
                        <p className="text-gray-600">
                            {Object.values(uiFilters).some(v => v && v !== "all")
                                ? "Aucune location ne correspond à vos critères."
                                : "Vous n'avez encore aucune location."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="w-full">
                        <div className="rounded-xl border border-gray-200 overflow-x-auto">
                            <DataTable columns={columns} data={filteredRentals} />
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <BookPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RentalHistory;