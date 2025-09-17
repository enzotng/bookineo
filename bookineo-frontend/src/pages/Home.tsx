import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, Spinner } from "../components/ui";
import { Plus, BookOpen, TrendingUp, Users } from "lucide-react";
import { booksAPI } from "../api/books";
import type { Book } from "../types/book";
import { ContactOwnerButton } from "../components/messaging";

const Home: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                setLoading(true);
                const { booksResponse, categories: fetchedCategories } = await booksAPI.getBooksAndCategories({
                    limit: 12,
                });

                setBooks(booksResponse.books);
                setCategories(fetchedCategories);

                const featured = booksResponse.books.filter((book: Book) => book.status === "available").slice(0, 6);
                setFeaturedBooks(featured);
            } catch (error) {
                console.error("Erreur lors du chargement:", error);
            } finally {
                setLoading(false);
            }
        };

        loadHomeData();
    }, []);

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

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "Non catégorisé";
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || "Non catégorisé";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Spinner size="md" />
            </div>
        );
    }

    return (
        <div className="space-y-8 overflow-x-hidden">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">Bienvenue sur Bookineo</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">Découvrez, partagez et louez des livres entre particuliers dans votre communauté</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center">
                    <CardContent className="p-6">
                        <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-gray-900">{books.length}</h3>
                        <p className="text-gray-600">Livres disponibles</p>
                    </CardContent>
                </Card>
                <Card className="text-center">
                    <CardContent className="p-6">
                        <Users className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-gray-900">{categories.length}</h3>
                        <p className="text-gray-600">Catégories</p>
                    </CardContent>
                </Card>
                <Card className="text-center">
                    <CardContent className="p-6">
                        <TrendingUp className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-gray-900">{books.filter((b) => b.status === "available").length}</h3>
                        <p className="text-gray-600">Disponibles maintenant</p>
                    </CardContent>
                </Card>
            </div>

            {featuredBooks.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Livres en vedette</h2>
                        <Button variant="outline" size="sm">
                            Voir tous les livres
                        </Button>
                    </div>

                    <div className="w-full overflow-hidden">
                        <Carousel className="w-full">
                            <CarouselContent className="-ml-4">
                                {featuredBooks.map((book) => (
                                    <CarouselItem key={book.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                        <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                                            <CardHeader className="pb-4 flex-shrink-0">
                                                <div className="aspect-[3/4] bg-gray-100 rounded-md overflow-hidden relative h-48 w-full mb-3">
                                                    {book.image_url ? (
                                                        <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-400 text-sm">Pas d'image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]" title={book.title}>
                                                    {book.title}
                                                </CardTitle>
                                                <div className="text-sm text-gray-600 truncate">par {book.author}</div>
                                                <div className="text-sm text-gray-500 h-5">{book.publication_year || ""}</div>
                                            </CardHeader>
                                            <CardContent className="flex-grow flex flex-col justify-end">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <Badge variant={getStatusBadgeVariant(book.status)}>{getStatusText(book.status)}</Badge>
                                                        <div className="font-semibold text-lg">{book.price}€</div>
                                                    </div>

                                                    <div className="text-sm text-gray-600 truncate">{getCategoryName(book.category_id)}</div>

                                                    <div className="flex space-x-2 mt-4">
                                                        <Button
                                                            className="flex-1"
                                                            variant={book.status === "available" ? "default" : "secondary"}
                                                            disabled={book.status !== "available"}
                                                        >
                                                            {book.status === "available" ? "Louer" : "Indisponible"}
                                                        </Button>

                                                        <ContactOwnerButton
                                                            book={book}
                                                            ownerName="Propriétaire"
                                                            ownerEmail="owner@example.com"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </div>
            )}

            {categories.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Parcourir par catégories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map((category) => (
                            <Card key={category.id}>
                                <CardContent>
                                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{books.filter((book) => book.category_id === category.id).length} livre(s)</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Livres récents</h2>
                    <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un livre
                    </Button>
                </div>

                {books.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun livre disponible</h3>
                            <p className="text-gray-600 mb-4">Soyez le premier à partager un livre avec la communauté</p>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter mon premier livre
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {books.slice(0, 8).map((book) => (
                            <Card key={book.id} className="hover:shadow-md transition-shadow h-full flex flex-col">
                                <CardHeader className="pb-4 flex-shrink-0">
                                    <div className="aspect-[3/4] bg-gray-100 rounded-md overflow-hidden relative h-48 w-full mb-3">
                                        {book.image_url ? (
                                            <img src={book.image_url} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400 text-sm">Pas d'image</span>
                                            </div>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]" title={book.title}>
                                        {book.title}
                                    </CardTitle>
                                    <div className="text-sm text-gray-600 truncate">par {book.author}</div>
                                    <div className="text-sm text-gray-500 h-5">{book.publication_year || ""}</div>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-end">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Badge variant={getStatusBadgeVariant(book.status)}>{getStatusText(book.status)}</Badge>
                                            <div className="font-semibold text-lg">{book.price}€</div>
                                        </div>

                                        <div className="text-sm text-gray-600 truncate">{getCategoryName(book.category_id)}</div>

                                        <div className="flex space-x-2 mt-4">
                                            <Button
                                                className="flex-1"
                                                variant={book.status === "available" ? "default" : "secondary"}
                                                disabled={book.status !== "available"}
                                            >
                                                {book.status === "available" ? "Louer" : "Indisponible"}
                                            </Button>

                                            <ContactOwnerButton
                                                book={book}
                                                ownerName="Propriétaire"
                                                ownerEmail="owner@example.com"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
