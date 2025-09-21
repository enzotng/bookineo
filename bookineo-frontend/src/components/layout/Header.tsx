import React, { useState, useEffect, useRef } from "react";
import { Button, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, Input } from "../ui";
import { Bell, Search, MessageCircle, Filter, X, BookOpen, User, Tag, Calendar, SlidersHorizontal, ShoppingCart, Edit, Trash2 } from "lucide-react";
import { useMessages } from "../../hooks/useMessages";
import { useRentalCart } from "../../contexts/RentalCartContext";
import { useNavigate } from "react-router-dom";
import { booksAPI } from "../../api/books";
import type { Book, Category } from "../../types/book";
import { Sidebar } from "./Sidebar";

export const Header: React.FC = () => {
    const { unreadCount } = useMessages();
    const { cart, removeFromCart } = useRentalCart();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        category: "all",
        status: "all",
        author: "",
        minYear: "",
        maxYear: "",
    });

    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoriesData = await booksAPI.getCategories();
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error loading categories:", error);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const abortController = new AbortController();

        const searchBooks = async () => {
            if (!searchQuery.trim() && !filters.author && filters.category === "all" && filters.status === "all" && !filters.minYear && !filters.maxYear) {
                setSearchResults([]);
                return;
            }

            if (searchQuery.trim() && searchQuery.trim().length < 2) {
                return;
            }

            try {
                setLoading(true);
                const searchQuery_trim = searchQuery.trim();
                const baseFilters = {
                    category_id: filters.category !== "all" && filters.category ? parseInt(filters.category) : undefined,
                    status: (filters.status !== "all" && filters.status) || undefined,
                    limit: 2,
                };

                let allResults: Book[] = [];

                if (searchQuery_trim) {
                    const [titleResponse, authorResponse, isbnResponse] = await Promise.all([
                        booksAPI.getBooks({ ...baseFilters, title: searchQuery_trim }),
                        booksAPI.getBooks({ ...baseFilters, author: searchQuery_trim }),
                        booksAPI.getBooks({ ...baseFilters, isbn: searchQuery_trim })
                    ]);

                    const titleResults = titleResponse.books || [];
                    const authorResults = authorResponse.books || [];
                    const isbnResults = isbnResponse.books || [];

                    const combinedResults = [...titleResults];

                    authorResults.forEach(book => {
                        if (!combinedResults.find(existing => existing.id === book.id)) {
                            combinedResults.push(book);
                        }
                    });

                    isbnResults.forEach(book => {
                        if (!combinedResults.find(existing => existing.id === book.id)) {
                            combinedResults.push(book);
                        }
                    });

                    allResults = combinedResults.slice(0, 6);
                } else if (filters.author) {
                    const booksResponse = await booksAPI.getBooks({ ...baseFilters, author: filters.author, limit: 6 });
                    allResults = booksResponse.books;
                } else {
                    const booksResponse = await booksAPI.getBooks({ ...baseFilters, limit: 6 });
                    allResults = booksResponse.books;
                }

                if (!abortController.signal.aborted) {
                    setSearchResults(allResults);
                    setIsSearchOpen(true);
                }
            } catch (error) {
                if (!abortController.signal.aborted) {
                    console.error("Search error:", error);
                    setSearchResults([]);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        const debounceTimer = setTimeout(searchBooks, 500);

        return () => {
            clearTimeout(debounceTimer);
            abortController.abort();
        };
    }, [searchQuery, filters]);

    const handleBookClick = (book: Book) => {
        navigate(`/books/${book.id}`);
        setIsSearchOpen(false);
        setSearchQuery("");
    };

    const clearSearch = () => {
        setSearchQuery("");
        setFilters({
            category: "all",
            status: "all",
            author: "",
            minYear: "",
            maxYear: "",
        });
        setSearchResults([]);
        setIsSearchOpen(false);
    };

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

    return (
        <header className="border-b bg-white backdrop-blur-lg px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between fixed top-0 left-0 lg:left-64 right-0 z-50">
            <div className="hidden lg:block flex-1 max-w-3xl" ref={searchRef}>
                <div className="relative">
                    <div className="flex gap-2">
                        <div className="relative flex-1 group">
                            <Search
                                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 z-10 transition-all duration-200 ${
                                    searchQuery ? "text-blue-500 scale-110" : "text-gray-400 group-hover:text-gray-600"
                                }`}
                            />
                            <Input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher par titre, auteur, ISBN..."
                                className="w-full pl-10 pr-10 py-2.5 bg-white/80 backdrop-blur transition-all duration-200 hover:bg-white/90 focus:bg-white focus:shadow-lg placeholder:transition-all placeholder:duration-200 group-hover:placeholder:text-gray-500"
                                onFocus={() => {
                                    if (searchResults.length > 0 || searchQuery) {
                                        setIsSearchOpen(true);
                                    }
                                }}
                            />
                            {(searchQuery || filters.author || filters.category !== "all" || filters.status !== "all" || filters.minYear || filters.maxYear) && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 z-10 transition-all duration-200 hover:scale-110 hover:bg-red-50 rounded-full p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="default">
                                    <SlidersHorizontal className={`w-4 h-4 transition-transform duration-200`} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[720px] rounded-xl p-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200" align="end" side="bottom">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-700">Auteur</label>
                                        <Input
                                            type="text"
                                            value={filters.author}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, author: e.target.value }))}
                                            placeholder="Nom de l'auteur"
                                            className="h-9 text-sm transition-all duration-150 w-full"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-700">Catégorie</label>
                                        <Select value={filters.category} onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}>
                                            <SelectTrigger className="h-9 text-sm transition-all duration-150 w-full">
                                                <SelectValue placeholder="Toutes" />
                                            </SelectTrigger>
                                            <SelectContent className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
                                                <SelectItem value="all">Toutes les catégories</SelectItem>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()} className="transition-colors duration-150">
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-700">Statut</label>
                                        <Select value={filters.status} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}>
                                            <SelectTrigger className="h-9 text-sm transition-all duration-150 w-full">
                                                <SelectValue placeholder="Tous" />
                                            </SelectTrigger>
                                            <SelectContent className="animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
                                                <SelectItem value="all">Tous les statuts</SelectItem>
                                                <SelectItem value="available" className="transition-colors duration-150">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                        Disponible
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="rented" className="transition-colors duration-150">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                        Loué
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="unavailable" className="transition-colors duration-150">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                                        Indisponible
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-700">Année min</label>
                                        <Input
                                            type="number"
                                            value={filters.minYear}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, minYear: e.target.value }))}
                                            placeholder="1900"
                                            className="h-9 text-sm transition-all duration-150 w-full"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs font-medium text-gray-700">Année max</label>
                                        <Input
                                            type="number"
                                            value={filters.maxYear}
                                            onChange={(e) => setFilters((prev) => ({ ...prev, maxYear: e.target.value }))}
                                            placeholder="2024"
                                            className="h-9 text-sm transition-all duration-150"
                                        />
                                    </div>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {isSearchOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-40 max-h-96 overflow-y-auto animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500 animate-in fade-in-0 duration-200">
                                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    Recherche en cours...
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="p-2">
                                    <div className="text-xs text-gray-500 px-3 py-2 border-b animate-in slide-in-from-left-2 duration-300">
                                        {searchResults.length} résultat{searchResults.length > 1 ? "s" : ""} trouvé{searchResults.length > 1 ? "s" : ""}
                                    </div>
                                    {searchResults.map((book, index) => (
                                        <div
                                            key={book.id}
                                            onClick={() => handleBookClick(book)}
                                            className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer border-b last:border-0 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm rounded-lg mx-1 animate-in slide-in-from-left-3 duration-300"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:shadow-md">
                                                {book.image_url ? (
                                                    <img src={book.image_url} alt={book.title} className="w-full h-full object-cover rounded-lg transition-transform duration-200 hover:scale-105" />
                                                ) : (
                                                    <BookOpen className="w-6 h-6 text-blue-500 transition-colors duration-200" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 truncate text-sm transition-colors duration-200 hover:text-blue-600">{book.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <User className="w-3 h-3 text-gray-400 transition-colors duration-200" />
                                                    <span className="text-xs text-gray-600 truncate">{book.author}</span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Tag className="w-3 h-3 text-gray-400 transition-colors duration-200" />
                                                        <span className="text-xs text-gray-500">{getCategoryName(book.category_id)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <div
                                                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                                                book.status === "available" ? "bg-emerald-400" : book.status === "rented" ? "bg-red-400" : "bg-gray-400"
                                                            }`}
                                                        ></div>
                                                        <span className="text-xs text-gray-500">{getStatusText(book.status)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-sm font-bold text-blue-600 transition-colors duration-200 hover:text-purple-600">{book.price}€</div>
                                                {book.publication_year && (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 transition-colors duration-200" />
                                                        {book.publication_year}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-3 border-t bg-gradient-to-r from-gray-50 to-blue-50 animate-in slide-in-from-bottom-2 duration-300">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                navigate("/books", { state: { searchQuery, filters } });
                                                setIsSearchOpen(false);
                                            }}
                                            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-all duration-200 hover:scale-[1.02] font-medium"
                                        >
                                            Voir tous les résultats
                                        </Button>
                                    </div>
                                </div>
                            ) : searchQuery || filters.author || filters.category !== "all" || filters.status !== "all" || filters.minYear || filters.maxYear ? (
                                <div className="p-6 text-center text-gray-500 animate-in fade-in-0 zoom-in-95 duration-300">
                                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-pulse" />
                                    <p className="text-sm animate-in slide-in-from-bottom-2 duration-300">Aucun livre trouvé</p>
                                    <p className="text-xs text-gray-400 mt-1 animate-in slide-in-from-bottom-3 duration-300 delay-100">Essayez de modifier vos critères de recherche</p>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            <div className="lg:hidden flex-1">
                <Sidebar mobile />
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
                <div className="relative">
                    <Button variant="ghost" size="default" className="border border-gray-200 rounded-lg hover:bg-gray-100 p-2 sm:p-3" onClick={() => navigate("/messages")}>
                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                        )}
                    </Button>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="relative">
                            <Button variant="ghost" size="default" className="border border-gray-200 rounded-lg hover:bg-gray-100 p-2 sm:p-3">
                                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                                {cart.total_items > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                        {cart.total_items > 99 ? "99+" : cart.total_items}
                                    </Badge>
                                )}
                            </Button>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-0" align="end" side="bottom">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold text-lg">Panier de location</h3>
                            <p className="text-sm text-gray-600">
                                {cart.total_items} livre{cart.total_items !== 1 ? "s" : ""}
                            </p>
                        </div>
                        {cart.total_items === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Votre panier est vide</p>
                            </div>
                        ) : (
                            <>
                                <div className="max-h-80 overflow-y-auto">
                                    {cart.items.map((item) => (
                                        <div key={item.book.id} className="p-3 border-b hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    {item.book.image_url ? (
                                                        <img src={item.book.image_url} alt={item.book.title} className="w-full h-full object-cover rounded-lg" />
                                                    ) : (
                                                        <BookOpen className="w-6 h-6 text-blue-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate text-sm">{item.book.title}</h4>
                                                    <p className="text-xs text-gray-600 truncate">{item.book.author}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-gray-600">
                                                            {item.duration_days > 0 ? `${item.duration_days} jour${item.duration_days !== 1 ? "s" : ""}` : "Non configuré"}
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900">{item.total_price > 0 ? `${item.total_price.toFixed(2)}€` : "--"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-100" onClick={() => navigate("/rental-cart")}>
                                                        <Edit className="h-3 w-3 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100" onClick={() => removeFromCart(item.book.id)}>
                                                        <Trash2 className="h-3 w-3 text-red-600" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 bg-gray-50 border-t">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">Total</span>
                                        <span className="text-lg font-bold text-blue-600">{cart.total_amount.toFixed(2)}€</span>
                                    </div>
                                    <Button onClick={() => navigate("/rental-cart")} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                        Voir le panier
                                    </Button>
                                </div>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
