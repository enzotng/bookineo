import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter, BookOpen } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Badge,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Spinner,
} from "../../components/ui";
import { booksAPI } from "../../api/books";
import { rentalsAPI, type Rental } from "../../api/rentals";
import { useAuth } from "../../hooks/useAuth";
import { PageHeader } from "../../components/layout";
import { FilterPanel } from "../../components/filters";
import type { FilterConfig } from "../../components/filters";
import { BookCard } from "../../components/books";
import type { Book, Category } from "../../types/book";
import { toast } from "react-toastify";
import BookPagination from "./components/BookPagination";

const RentedBooks: React.FC = () => {
    const { user } = useAuth();
    const [rentals, setRentals] = useState<Rental[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [uiFilters, setUiFilters] = useState<Record<string, any>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRentals, setTotalRentals] = useState(0);

    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);

    const ITEMS_PER_PAGE = 12;

    const loadRentedBooks = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await rentalsAPI.getRentalsByUser(user.id.toString());
            let filteredRentals = data.filter(rental => rental.status === 'active');

            if (uiFilters.search) {
                filteredRentals = filteredRentals.filter(rental =>
                    rental.book_title?.toLowerCase().includes(uiFilters.search.toLowerCase())
                );
            }

            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const paginatedRentals = filteredRentals.slice(startIndex, endIndex);

            setRentals(paginatedRentals);
            setTotalRentals(filteredRentals.length);
            setTotalPages(Math.ceil(filteredRentals.length / ITEMS_PER_PAGE));

            if (categories.length === 0) {
                const categoriesData = await booksAPI.getCategories();
                setCategories(categoriesData);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des locations:", error);
            toast.error("Erreur lors du chargement de vos locations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRentedBooks();
    }, [currentPage, uiFilters, user]);

    const handleReturnBook = async (rental: Rental) => {
        try {
            await rentalsAPI.returnBook(rental.id, new Date().toISOString().split('T')[0]);
            toast.success("Livre retourné avec succès !");
            loadRentedBooks();
        } catch (error) {
            console.error("Erreur lors du retour:", error);
            toast.error("Erreur lors du retour du livre");
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Date inconnue';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Date invalide';
            return date.toLocaleDateString("fr-FR");
        } catch (error) {
            return 'Date invalide';
        }
    };

    const getDaysRemaining = (expectedReturnDate: string | undefined) => {
        if (!expectedReturnDate) return 0;

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const returnDate = new Date(expectedReturnDate);
            if (isNaN(returnDate.getTime())) return 0;

            returnDate.setHours(0, 0, 0, 0);

            const diffTime = returnDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            console.error('Erreur calcul jours restants:', error);
            return 0;
        }
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
            placeholder: 'Rechercher par titre...'
        }
    ];

    if (loading && rentals.length === 0) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <Spinner size="md" />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <PageHeader
                title="Livres loués"
                subtitle={`Vos ${totalRentals} livre${totalRentals !== 1 ? 's' : ''} actuellement loué${totalRentals !== 1 ? 's' : ''}`}
                icon={BookOpen}
                actions={
                    <Button onClick={() => window.location.href = '/books'} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all">
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">Voir tous les livres</span>
                    </Button>
                }
            />

            <FilterPanel
                title="Filtres"
                subtitle={`Filtrez vos ${totalRentals} location${totalRentals !== 1 ? 's' : ''}`}
                filters={uiFilters}
                onFiltersChange={handleFiltersChange}
                filterConfigs={filterConfigs}
                onClearFilters={resetFilters}
            />

            {rentals.length === 0 ? (
                <Card className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-200">
                    <CardContent className="p-12 text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune location en cours</h3>
                        <p className="text-gray-600 mb-4">
                            {Object.values(uiFilters).some(v => v && v !== "all")
                                ? "Aucun livre ne correspond à vos critères de recherche."
                                : "Vous ne louez actuellement aucun livre."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {rentals.map((rental) => {
                            const daysRemaining = getDaysRemaining(rental.expected_return_date);
                            const isOverdue = daysRemaining < 0;

                            const bookFromRental: Book = {
                                id: rental.id,
                                title: rental.book_title || 'Titre inconnu',
                                author: rental.book_author || 'Auteur inconnu',
                                isbn: '',
                                price: 0,
                                status: 'rented' as const,
                                category_id: rental.category_id,
                                image_url: rental.book_image_url,
                                description: rental.comment || '',
                                owner_id: 0,
                                created_at: rental.rental_date || '',
                                updated_at: rental.rental_date || ''
                            };

                            return (
                                <BookCard
                                    key={rental.id}
                                    book={bookFromRental}
                                    primaryAction={{
                                        label: "Retourner",
                                        onClick: () => handleReturnBook(rental)
                                    }}
                                    overlays={{
                                        topRight: (
                                            <Badge className={`${
                                                isOverdue ? 'bg-red-100 text-red-800 border-red-300' :
                                                daysRemaining <= 3 ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                                'bg-emerald-100 text-emerald-800 border-emerald-300'
                                            } shadow-lg text-xs`}>
                                                {isOverdue
                                                    ? `${Math.abs(daysRemaining)}j retard`
                                                    : daysRemaining === 0
                                                    ? "Retour aujourd'hui"
                                                    : `${daysRemaining}j restant${daysRemaining > 1 ? 's' : ''}`
                                                }
                                            </Badge>
                                        ),
                                        bottomOverlay: (
                                            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Loué le:</span>
                                                    <span className="font-medium">{formatDate(rental.rental_date)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Retour:</span>
                                                    <span className="font-medium">{formatDate(rental.expected_return_date)}</span>
                                                </div>
                                            </div>
                                        )
                                    }}
                                />
                            );
                        })}
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

export default RentedBooks;