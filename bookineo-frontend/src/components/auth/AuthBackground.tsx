import React from "react";
import { Card, CardContent, Badge } from "../ui";
import { BookOpen, TrendingUp, Star, Zap, Users, Heart } from "lucide-react";

interface AuthBackgroundProps {
    type: "login" | "register";
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ type }) => {
    const isLogin = type === "login";

    const statsCards = isLogin ? [
        { icon: TrendingUp, value: "250+", label: "Livres disponibles", color: "text-blue-600", position: "top-12 sm:top-16 left-2 sm:left-4 lg:left-8" },
        { icon: Users, value: "50+", label: "Utilisateurs actifs", color: "text-purple-500", position: "top-2 sm:top-4 right-2 sm:right-4 lg:right-8" },
        { icon: Star, value: "15", label: "Catégories", color: "text-blue-700", position: "bottom-24 sm:bottom-32 left-2 sm:left-4 lg:left-12" }
    ] : [
        { icon: Heart, value: "∞", label: "Passions partagées", color: "text-purple-600", position: "top-12 sm:top-16 left-2 sm:left-4 lg:left-8" },
        { icon: Users, value: "50+", label: "Lecteurs", color: "text-purple-500", position: "top-2 sm:top-4 right-2 sm:right-4 lg:right-8" },
        { icon: Zap, value: "24/7", label: "Disponibilité", color: "text-blue-700", position: "bottom-24 sm:bottom-32 left-2 sm:left-4 lg:left-12" }
    ];

    const books = isLogin ? [
        { title: "Clean Code", author: "Robert C. Martin", price: "12", status: "available" },
        { title: "React Patterns", author: "Michael Chan", price: "8", status: "available" },
        { title: "TypeScript Deep Dive", author: "Basarat Ali Syed", price: "15", status: "rented" },
        { title: "Node.js Design", author: "Mario Casciaro", price: "20", status: "available" }
    ] : [
        { title: "L'Art de la Lecture", author: "Marguerite Duras", price: "10", status: "available" },
        { title: "Conseils aux Écrivains", author: "Stephen King", price: "18", status: "available" },
        { title: "Histoire des Mots", author: "Claude Duneton", price: "14", status: "rented" },
        { title: "La Bibliothèque", author: "Alberto Manguel", price: "16", status: "available" },
        { title: "Éloge de la Lecture", author: "Michèle Petit", price: "12", status: "available" }
    ];

    const bookPositions = isLogin ? [
        "top-[25%] left-[12%] -translate-y-8 hidden sm:block",
        "top-[35%] right-[10%] -translate-y-2",
        "bottom-[35%] left-[15%] -translate-y-6 hidden sm:block",
        "bottom-[25%] right-[8%] -translate-y-9 hidden lg:block"
    ] : [
        "top-[20%] left-[12%] -translate-y-8 hidden sm:block",
        "top-[30%] right-[10%] -translate-y-2",
        "top-[50%] left-[8%] -translate-y-10 hidden lg:block",
        "bottom-[30%] right-[8%] -translate-y-9 hidden lg:block",
        "bottom-[20%] left-[12%] -translate-y-4 hidden md:block"
    ];

    return (
        <>
            {statsCards.map((stat, index) => (
                <Card key={index} className={`absolute ${stat.position} bg-baby-powder-900/85 backdrop-blur border-0 shadow-xl z-20 hover:shadow-2xl hover:-translate-y-1 hover:z-40 transition-all duration-500`}>
                    <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                        <stat.icon className={`w-6 sm:w-8 h-6 sm:h-8 ${stat.color} mx-auto mb-1 sm:mb-2`} />
                        <div className={`text-xl sm:text-3xl lg:text-4xl font-black ${stat.color} mb-1`}>{stat.value}</div>
                        <div className="text-xs font-medium text-muted-foreground">{stat.label}</div>
                    </CardContent>
                </Card>
            ))}

            {!isLogin && (
                <Card className="absolute top-6 sm:top-8 left-1/2 transform -translate-x-1/2 bg-baby-powder-900/95 backdrop-blur border-0 shadow-2xl z-25 hover:shadow-3xl hover:-translate-y-1 hover:z-50 transition-all duration-500 max-w-xs sm:max-w-sm mx-4">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Heart className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600 animate-pulse" />
                            <span className="text-sm sm:text-lg font-black bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Rejoignez-nous</span>
                        </div>
                        <div className="flex gap-3 sm:gap-4">
                            <div className="aspect-[3/4] w-16 sm:w-20 bg-baby-powder-700 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                                <div className="w-full h-full bg-gradient-to-br from-blue-800 to-purple-800 flex items-center justify-center">
                                    <BookOpen className="w-4 sm:w-6 h-4 sm:h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm sm:text-base font-black mb-2 line-clamp-2 leading-tight">Découvrez des trésors littéraires</h3>
                                <p className="text-xs text-muted-foreground mb-2 sm:mb-3">Communauté de lecteurs</p>
                                <Badge className="bg-blue-600 text-white text-xs mb-2">Gratuit</Badge>
                                <div className="text-lg sm:text-xl font-black bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">0€</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="absolute inset-0 pointer-events-none">
                {books.map((book, index) => (
                    <Card key={index} className={`absolute ${bookPositions[index]} w-32 sm:w-36 lg:w-44 bg-baby-powder-900/75 backdrop-blur border-0 shadow-lg hover:shadow-xl hover:bg-baby-powder-900/90 transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:z-50 pointer-events-auto cursor-pointer z-10`}>
                        <CardContent className="p-2 sm:p-3">
                            <div className="aspect-[3/4] bg-baby-powder-700 rounded-md overflow-hidden mb-2 shadow-sm">
                                <div className="w-full h-full bg-gradient-to-br from-blue-800 to-purple-800 flex items-center justify-center">
                                    <BookOpen className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                                </div>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold line-clamp-2 mb-1 leading-tight">{book.title}</h4>
                            <p className="text-xs text-muted-foreground mb-1 truncate">{book.author}</p>
                            <div className="flex justify-between items-center">
                                <Badge className={`text-xs ${book.status === "available" ? "bg-blue-600 text-white" : "bg-purple-600 text-white"}`}>
                                    {book.status === "available" ? "Disponible" : "Loué"}
                                </Badge>
                                <span className="text-xs font-black bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">{book.price}€</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="absolute top-1/4 left-1/3 w-1 sm:w-2 h-1 sm:h-2 bg-blue-600 rounded-full animate-ping opacity-60"></div>
            <div className="absolute top-3/4 right-1/3 w-2 sm:w-3 h-2 sm:h-3 bg-purple-500 rounded-full animate-pulse opacity-40"></div>
            <div className="absolute top-1/2 left-1/5 w-1 h-1 bg-purple-600 rounded-full animate-bounce opacity-70 hidden sm:block"></div>
            <div className="absolute bottom-1/3 right-1/4 w-1 sm:w-2 h-1 sm:h-2 bg-blue-700 rounded-full animate-ping opacity-50"></div>
            <div className="absolute top-1/6 right-1/2 w-1 h-1 bg-purple-700 rounded-full animate-pulse opacity-60 hidden lg:block"></div>
        </>
    );
};