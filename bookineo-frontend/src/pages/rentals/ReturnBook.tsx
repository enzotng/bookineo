import React, { useState, useEffect } from "react";
import { RotateCcw, Search, BookOpen, Calendar, MessageSquare, CheckCircle } from "lucide-react";
import {
    Card,
    CardContent,
    Button,
    Badge,
    Spinner,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "../../components/ui";
import { rentalsAPI, type Rental } from "../../api/rentals";
import { useAuth } from "../../hooks/useAuth";
import { PageHeader } from "../../components/layout";
import { FilterPanel } from "../../components/filters";
import type { FilterConfig } from "../../components/filters";
import { toast } from "react-toastify";
import BookPagination from "../books/components/BookPagination";

const ReturnBook: React.FC = () => {
    const { user } = useAuth();
    const [activeRentals, setActiveRentals] = useState<Rental[]>([]);
    const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [uiFilters, setUiFilters] = useState<Record<string, any>>({});
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnComment, setReturnComment] = useState("");
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [isReturning, setIsReturning] = useState(false);

    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        loadActiveRentals();
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [activeRentals, uiFilters, currentPage]);

    const loadActiveRentals = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const data = await rentalsAPI.getRentalsByUser(user.id.toString());
            const active = data.filter(rental => rental.status === 'active');
            setActiveRentals(active);
        } catch (error) {
            console.error("Error loading active rentals:", error);
            toast.error("Erreur lors du chargement de vos locations");
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...activeRentals];

        if (uiFilters.search) {
            filtered = filtered.filter(rental =>
                rental.book_title?.toLowerCase().includes(uiFilters.search.toLowerCase()) ||
                rental.book_author?.toLowerCase().includes(uiFilters.search.toLowerCase())
            );
        }

        if (uiFilters.overdue) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            filtered = filtered.filter(rental => {
                if (!rental.expected_return_date) return false;
                const expectedDate = new Date(rental.expected_return_date);
                expectedDate.setHours(0, 0, 0, 0);
                return expectedDate < today;
            });
        }

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setFilteredRentals(filtered.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    };

    const handleReturnClick = (rental: Rental) => {
        setSelectedRental(rental);
        setReturnComment("");
        setReturnDate(new Date().toISOString().split('T')[0]);
        setIsReturnModalOpen(true);
    };

    const handleReturnConfirm = async () => {
        if (!selectedRental) return;

        try {
            setIsReturning(true);
            await rentalsAPI.returnBook(
                selectedRental.id,
                returnDate,
                returnComment || undefined
            );

            toast.success("Livre retourné avec succès !");
            setIsReturnModalOpen(false);
            setSelectedRental(null);
            await loadActiveRentals();
        } catch (error) {
            console.error("Error returning book:", error);
            toast.error("Erreur lors du retour du livre");
        } finally {
            setIsReturning(false);
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Date inconnue';
        try {
            return new Date(dateString).toLocaleDateString("fr-FR");
        } catch {
            return 'Date invalide';
        }
    };

    const getDaysOverdue = (expectedReturnDate: string | undefined) => {
        if (!expectedReturnDate) return 0;
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expectedDate = new Date(expectedReturnDate);
            expectedDate.setHours(0, 0, 0, 0);
            const diffTime = today.getTime() - expectedDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 0;
        } catch {
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
            placeholder: 'Rechercher par titre ou auteur...'
        },
        {
            key: 'overdue',
            type: 'checkbox',
            label: 'Livres en retard uniquement',
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
        <div className="w-full h-full flex flex-col gap-4 overflow-y-auto rounded-lg">
            <PageHeader
                title="Retourner un livre"
                subtitle={`${activeRentals.length} livre${activeRentals.length !== 1 ? 's' : ''} à retourner`}
                icon={RotateCcw}
            />

            <FilterPanel
                title="Filtres"
                subtitle={`Gérez vos ${activeRentals.length} location${activeRentals.length !== 1 ? 's' : ''} en cours`}
                filters={uiFilters}
                onFiltersChange={handleFiltersChange}
                filterConfigs={filterConfigs}
                onClearFilters={resetFilters}
            />

            {filteredRentals.length === 0 ? (
                <Card className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-200">
                    <CardContent className="p-12 text-center">
                        <RotateCcw className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {activeRentals.length === 0 ? "Aucune location en cours" : "Aucun livre trouvé"}
                        </h3>
                        <p className="text-gray-600">
                            {activeRentals.length === 0
                                ? "Vous n'avez actuellement aucun livre à retourner."
                                : "Aucun livre ne correspond à vos critères de recherche."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredRentals.map((rental, index) => {
                            const daysOverdue = getDaysOverdue(rental.expected_return_date);
                            const isOverdue = daysOverdue > 0;

                            return (
                                <Card
                                    key={rental.id}
                                    className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 animate-in slide-in-from-left-2"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex flex-col gap-4">
                                            <div className="relative">
                                                <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-3">
                                                    {rental.book_image_url ? (
                                                        <img
                                                            src={rental.book_image_url}
                                                            alt={rental.book_title}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <BookOpen className="w-8 h-8 text-blue-500" />
                                                    )}
                                                </div>

                                                {isOverdue && (
                                                    <Badge className="absolute -top-2 -right-2 bg-red-100 text-red-800 border-red-300 shadow-lg animate-pulse">
                                                        {daysOverdue}j retard
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="font-bold text-sm text-gray-900 line-clamp-2">
                                                    {rental.book_title || 'Titre inconnu'}
                                                </h3>
                                                <p className="text-xs text-gray-600 truncate">
                                                    {rental.book_author || 'Auteur inconnu'}
                                                </p>
                                            </div>

                                            <div className="space-y-2 text-xs text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Loué le {formatDate(rental.rental_date)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                                        Retour prévu le {formatDate(rental.expected_return_date)}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => handleReturnClick(rental)}
                                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all font-medium"
                                                size="sm"
                                            >
                                                <RotateCcw className="w-4 h-4 mr-2" />
                                                Retourner
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
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

            <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RotateCcw className="w-5 h-5 text-emerald-600" />
                            Retourner le livre
                        </DialogTitle>
                        <DialogDescription>
                            Confirmer le retour de "{selectedRental?.book_title}"
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date de retour *
                            </label>
                            <Input
                                type="date"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                className="w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commentaire (facultatif)
                            </label>
                            <textarea
                                value={returnComment}
                                onChange={(e) => setReturnComment(e.target.value)}
                                placeholder="État du livre, remarques..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsReturnModalOpen(false)}
                            className="flex-1"
                            disabled={isReturning}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleReturnConfirm}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                            disabled={isReturning || !returnDate}
                        >
                            {isReturning ? (
                                <Spinner size="sm" />
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Confirmer
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReturnBook;