import React, { useState, useEffect } from "react";
import { Card, CardContent, Badge, Spinner } from "../components/ui";
import { BookOpen, TrendingUp, Users, Star, Sparkles, Crown, Compass } from "lucide-react";
import { BookCard } from "../components/books";
import { booksAPI } from "../api/books";
import type { Book } from "../types/book";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="w-full h-full flex flex-col gap-10">
            <BookSection books={newBooks} title="Nouveautés" subtitle="Les derniers arrivages de la semaine" gradientColor="from-blue-500 to-purple-600" icon={Sparkles} />

            <BookSection books={popularBooks} title="Coups de cœur" subtitle="Les préférés de notre communauté" gradientColor="from-purple-500 to-blue-600" icon={Crown} />

            <BookSection books={discoveryBooks} title="À découvrir" subtitle="Explorez de nouveaux horizons littéraires" gradientColor="from-blue-600 to-purple-500" icon={Compass} />
        </div>
    );
};

export default Home;
