import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    Button,
    Badge,
    DatePicker,
    Spinner,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui";
import { PageHeader } from "../../components/layout";
import { booksAPI } from "../../api/books";
import { usersAPI } from "../../api/users";
import { rentalsAPI } from "../../api/rentals";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import {
    BookOpen,
    User,
    Calendar,
    Euro,
    Clock,
    CheckCircle,
    ArrowLeft,
} from "lucide-react";
import type { Book } from "../../types/book";
import type { User as UserType } from "../../api/users";

const RentBookPage: React.FC = () => {
    const { bookId } = useParams<{ bookId: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [book, setBook] = useState<Book | null>(null);
    const [users, setUsers] = useState<UserType[]>([]);
    const [selectedRenter, setSelectedRenter] = useState<string>("");
    const [rentalDate, setRentalDate] = useState<Date | undefined>();
    const [returnDate, setReturnDate] = useState<Date | undefined>();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [durationDays, setDurationDays] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            if (!bookId) return;

            try {
                setLoading(true);
                const [bookResponse, usersResponse] = await Promise.all([
                    booksAPI.getBookById(bookId),
                    usersAPI.getAllUsers(),
                ]);

                setBook(bookResponse);
                setUsers(usersResponse);

                // Set current user as default renter
                if (currentUser) {
                    setSelectedRenter(currentUser.id.toString());
                }
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Erreur lors du chargement des données");
                navigate("/books");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [bookId, currentUser, navigate]);

    useEffect(() => {
        if (rentalDate && returnDate && book) {
            const diffTime = returnDate.getTime() - rentalDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDurationDays(diffDays);
            setTotalPrice(book.price * diffDays);
        } else {
            setDurationDays(0);
            setTotalPrice(0);
        }
    }, [rentalDate, returnDate, book]);

    const handleSubmit = async () => {
        if (!book || !selectedRenter || !rentalDate || !returnDate) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        if (returnDate <= rentalDate) {
            toast.error("La date de retour doit être après la date de location");
            return;
        }

        try {
            setProcessing(true);
            const rentalDateStr = rentalDate.toISOString().split('T')[0];
            const returnDateStr = returnDate.toISOString().split('T')[0];

            await rentalsAPI.rentBook(book.id, selectedRenter, rentalDateStr, returnDateStr);

            toast.success("Location confirmée avec succès!");
            navigate("/history");
        } catch (error) {
            console.error("Error creating rental:", error);
            toast.error("Erreur lors de la confirmation de la location");
        } finally {
            setProcessing(false);
        }
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
            <div className="w-full h-full flex flex-col gap-6">
                <PageHeader
                    title="Livre non trouvé"
                    subtitle="Ce livre n'existe pas ou n'est plus disponible"
                    icon={BookOpen}
                />
                <div className="flex justify-center">
                    <Button onClick={() => navigate("/books")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour aux livres
                    </Button>
                </div>
            </div>
        );
    }

    const selectedRenterInfo = users.find(u => u.id === selectedRenter);

    return (
        <div className="w-full h-full flex flex-col gap-6 overflow-y-auto">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/books")}
                    className="self-start"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </Button>
                <PageHeader
                    title="Nouvelle location"
                    subtitle="Configurez les détails de la location"
                    icon={BookOpen}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Book Details */}
                <Card className="h-fit">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Livre à louer
                        </h3>

                        <div className="flex gap-4 mb-4">
                            <div className="w-24 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                                {book.image_url ? (
                                    <img
                                        src={book.image_url}
                                        alt={book.title}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-1 mx-auto">
                                            <BookOpen className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="text-xs text-gray-700 font-medium text-center px-1">
                                            {book.title.slice(0, 10)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-lg mb-1">{book.title}</h4>
                                <p className="text-gray-600 mb-2">par {book.author}</p>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800">
                                        Disponible
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {book.price}€/jour
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {book.publication_year && (
                                <div>
                                    <span className="text-gray-500">Année:</span>
                                    <div className="font-medium">{book.publication_year}</div>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-500">Propriétaire:</span>
                                <div className="font-medium">
                                    {`${book.first_name || ''} ${book.last_name || ''}`.trim() || 'Non défini'}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rental Configuration */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            Configuration de la location
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Locataire
                                </label>
                                <Select value={selectedRenter} onValueChange={setSelectedRenter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un locataire" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium">
                                                        {`${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase()}
                                                    </div>
                                                    <span>
                                                        {`${user.first_name} ${user.last_name}`.trim()}
                                                        {user.id === currentUser?.id && " (Vous)"}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Date de début
                                    </label>
                                    <DatePicker
                                        date={rentalDate}
                                        onSelect={setRentalDate}
                                        minDate={new Date()}
                                        placeholder="Choisir la date"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Date de retour
                                    </label>
                                    <DatePicker
                                        date={returnDate}
                                        onSelect={setReturnDate}
                                        minDate={rentalDate || new Date()}
                                        placeholder="Choisir la date"
                                    />
                                </div>
                            </div>

                            {durationDays > 0 && (
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-sm text-blue-600 mb-1 flex items-center justify-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Durée
                                            </div>
                                            <div className="text-xl font-bold text-blue-700">
                                                {durationDays} jour{durationDays > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-purple-600 mb-1 flex items-center justify-center gap-1">
                                                <Euro className="w-4 h-4" />
                                                Total
                                            </div>
                                            <div className="text-xl font-bold text-purple-700">
                                                {totalPrice.toFixed(2)}€
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedRenterInfo && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-2">Locataire sélectionné:</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-medium">
                                            {`${selectedRenterInfo.first_name?.charAt(0) || ''}${selectedRenterInfo.last_name?.charAt(0) || ''}`.toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {`${selectedRenterInfo.first_name} ${selectedRenterInfo.last_name}`.trim()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {selectedRenterInfo.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold">Confirmer la location</h3>
                            <p className="text-gray-600">
                                {totalPrice > 0 ? `Total: ${totalPrice.toFixed(2)}€ pour ${durationDays} jour${durationDays > 1 ? 's' : ''}` : "Configurez les dates pour voir le total"}
                            </p>
                        </div>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing || !selectedRenter || !rentalDate || !returnDate || totalPrice === 0}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        >
                            {processing ? (
                                <Spinner size="sm" className="mr-2" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            {processing ? "Confirmation..." : "Confirmer la location"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RentBookPage;