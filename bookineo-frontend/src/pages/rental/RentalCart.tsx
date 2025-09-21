import React, { useState, useEffect } from "react";
import { ShoppingCart, Calendar, Trash2, CreditCard, Edit, Check, X, BookOpen, Sparkles, Crown, Compass, Clock } from "lucide-react";
import {
    Card,
    CardContent,
    Button,
    Badge,
    DatePicker,
    Spinner,
} from "../../components/ui";
import { PageHeader } from "../../components/layout";
import { BookCard } from "../../components/books";
import { useAuth } from "../../hooks/useAuth";
import { useRentalCart } from "../../contexts/RentalCartContext";
import { booksAPI } from "../../api/books";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { RentalCartItem } from "../../types/rental-cart";
import type { Book } from "../../types/book";

const RentalCart: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cart, removeFromCart, updateCartItem, clearCart, processRentals, isProcessing } = useRentalCart();
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [tempDates, setTempDates] = useState<{
        rental_date: Date | undefined;
        expected_return_date: Date | undefined;
    }>({ rental_date: undefined, expected_return_date: undefined });
    const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);

    useEffect(() => {
        const loadSuggestions = async () => {
            try {
                setLoadingSuggestions(true);
                const { booksResponse } = await booksAPI.getBooksAndCategories({
                    status: "available",
                    limit: 12,
                });
                const availableBooks = booksResponse.books.filter((book) =>
                    book.owner_id !== user?.id && !cart.items.find(item => item.book.id === book.id)
                );
                setSuggestedBooks(availableBooks);
            } catch (error) {
                console.error("Error loading suggestions:", error);
            } finally {
                setLoadingSuggestions(false);
            }
        };

        loadSuggestions();
    }, [user?.id, cart.items]);

    const handleEditItem = (item: RentalCartItem) => {
        setEditingItem(item.book.id);
        setTempDates({
            rental_date: item.rental_date ? new Date(item.rental_date) : undefined,
            expected_return_date: item.expected_return_date ? new Date(item.expected_return_date) : undefined,
        });
    };

    const handleSaveEdit = (bookId: string) => {
        if (!tempDates.rental_date || !tempDates.expected_return_date) {
            toast.error("Veuillez sélectionner les deux dates");
            return;
        }

        if (tempDates.expected_return_date <= tempDates.rental_date) {
            toast.error("La date de retour doit être après la date de début");
            return;
        }

        const rental_date = tempDates.rental_date.toISOString().split('T')[0];
        const expected_return_date = tempDates.expected_return_date.toISOString().split('T')[0];

        updateCartItem(bookId, {
            rental_date,
            expected_return_date,
        });

        setEditingItem(null);
        toast.success("Dates mises à jour");
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setTempDates({ rental_date: undefined, expected_return_date: undefined });
    };

    const handleProcessRentals = async () => {
        const incompleteItems = cart.items.filter(item => !item.rental_date || !item.expected_return_date);

        if (incompleteItems.length > 0) {
            toast.error("Veuillez configurer les dates pour tous les livres");
            return;
        }

        const success = await processRentals();
        if (success) {
            navigate("/home");
        }
    };

    const BookSection = ({ books, title, subtitle, gradientColor, icon: Icon }: { books: Book[]; title: string; subtitle: string; gradientColor: string; icon: any }) => (
        <div className="w-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${gradientColor} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-foreground">{title}</h2>
                        <div className="text-sm text-muted-foreground">{subtitle}</div>
                    </div>
                </div>
                <div className="text-sm text-purple-600 font-medium">{books.length} livres</div>
            </div>

            <div className="rounded-2xl border border-baby-powder-700/50 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {books.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            onBookClick={() => navigate(`/books/${book.id}`)}
                            showActions={true}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

    if (cart.total_items === 0) {
        return (
            <div className="w-full h-full flex flex-col gap-6 overflow-y-auto rounded-lg">
                <PageHeader
                    title="Panier de location"
                    subtitle="Gérez vos livres à louer"
                    icon={ShoppingCart}
                />

                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8 text-center">
                        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold mb-2">Votre panier est vide</h3>
                        <p className="text-gray-600 mb-4">Parcourez notre catalogue et ajoutez des livres à votre panier.</p>
                        <Button onClick={() => navigate("/books")}>
                            Parcourir les livres
                        </Button>
                    </CardContent>
                </Card>

                {loadingSuggestions ? (
                    <div className="flex justify-center items-center py-8">
                        <Spinner size="md" />
                    </div>
                ) : suggestedBooks.length > 0 && (
                    <BookSection
                        books={suggestedBooks.slice(0, 8)}
                        title="Découvrez ces livres"
                        subtitle="Ajoutez d'autres livres à votre panier"
                        gradientColor="from-blue-500 to-purple-600"
                        icon={Sparkles}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto rounded-lg">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Panier de location"
                    subtitle={`${cart.total_items} livre${cart.total_items !== 1 ? 's' : ''} dans votre panier`}
                    icon={ShoppingCart}
                />
                <Button variant="outline" onClick={clearCart} disabled={isProcessing}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Vider le panier
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cart.items.map((item) => (
                    <div key={item.book.id} className="group relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl p-1 shadow-lg hover:shadow-2xl transition-all duration-500 backdrop-blur-sm border border-white/50">
                        <div className="relative bg-white rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.book.id)}
                                className="absolute top-2 right-2 z-20 h-8 w-8 p-0 bg-white/80 hover:bg-red-50 text-red-600 rounded-full shadow-sm"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>

                            <div className="p-4 flex flex-col h-full">
                                <div className="flex gap-4 mb-4">
                                    <div className="w-20 h-28 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300">
                                        {item.book.image_url ? (
                                            <img src={item.book.image_url} alt={item.book.title} className="w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-1 mx-auto">
                                                    <BookOpen className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="text-xs text-gray-700 font-medium text-center leading-tight">{item.book.title.slice(0, 15)}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">{item.book.title}</h3>
                                        <p className="text-gray-600 text-sm mb-2 truncate">{item.book.author}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">{item.book.price}€/jour</Badge>
                                            {item.total_price > 0 && (
                                                <div className="text-lg font-bold text-blue-600">
                                                    {item.total_price.toFixed(2)}€
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1">
                                    {editingItem === item.book.id ? (
                                        <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-blue-800">Date de début</label>
                                                    <DatePicker
                                                        date={tempDates.rental_date}
                                                        onSelect={(date) => setTempDates(prev => ({ ...prev, rental_date: date }))}
                                                        minDate={new Date()}
                                                        placeholder="Choisir la date de début"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-blue-800">Date de retour</label>
                                                    <DatePicker
                                                        date={tempDates.expected_return_date}
                                                        onSelect={(date) => setTempDates(prev => ({ ...prev, expected_return_date: date }))}
                                                        minDate={tempDates.rental_date || new Date()}
                                                        placeholder="Choisir la date de retour"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" onClick={() => handleSaveEdit(item.book.id)} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Confirmer
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                                    <X className="w-4 h-4 mr-1" />
                                                    Annuler
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <div className="text-xs text-gray-500 mb-1">
                                                        <Calendar className="w-3 h-3 inline mr-1" />
                                                        Début
                                                    </div>
                                                    <div className="font-semibold text-sm text-gray-900">
                                                        {item.rental_date ? new Date(item.rental_date).toLocaleDateString('fr-FR') : 'Non défini'}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-2">
                                                    <div className="text-xs text-gray-500 mb-1">
                                                        <Calendar className="w-3 h-3 inline mr-1" />
                                                        Retour
                                                    </div>
                                                    <div className="font-semibold text-sm text-gray-900">
                                                        {item.expected_return_date ? new Date(item.expected_return_date).toLocaleDateString('fr-FR') : 'Non défini'}
                                                    </div>
                                                </div>
                                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-2">
                                                    <div className="text-xs text-blue-600 mb-1">
                                                        <Clock className="w-3 h-3 inline mr-1" />
                                                        Durée
                                                    </div>
                                                    <div className="font-bold text-sm text-blue-700">
                                                        {item.duration_days > 0 ? `${item.duration_days}j` : '--'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-center">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleEditItem(item)}
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all font-semibold"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    {item.rental_date ? 'Modifier les dates' : 'Configurer les dates'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">Total du panier</h3>
                        <div className="text-2xl font-bold text-blue-600">
                            {cart.total_amount > 0 ? `${cart.total_amount.toFixed(2)}€` : 'À configurer'}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleProcessRentals}
                            disabled={isProcessing || cart.total_amount === 0}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {isProcessing ? "Traitement..." : "Finaliser les locations"}
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/books")}>
                            Continuer les achats
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {!loadingSuggestions && suggestedBooks.length > 0 && (
                <BookSection
                    books={suggestedBooks.slice(0, 8)}
                    title="Vous pourriez aussi aimer"
                    subtitle="D'autres livres qui pourraient vous intéresser"
                    gradientColor="from-purple-500 to-blue-600"
                    icon={Crown}
                />
            )}
        </div>
    );
};

export default RentalCart;