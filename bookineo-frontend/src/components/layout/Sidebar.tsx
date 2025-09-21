import React from "react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    Button,
    Separator,
    Avatar,
    AvatarFallback,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui";
import { Menu, Home, Book, BookOpen, User, MessageCircle, LogOut, ChevronDown, Plus, RotateCcw, History, Bookmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMessages } from "../../hooks/useMessages";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
    mobile?: boolean;
}

const menuItems = [
    {
        title: "Accueil",
        href: "/home",
        icon: Home,
    },
    {
        title: "Tous les livres",
        href: "/books",
        icon: BookOpen,
    },
];

const rentalItems = [
    {
        title: "Panier de location",
        href: "/rental-cart",
        icon: Plus,
        description: "Gérer votre panier et louer des livres",
    },
    {
        title: "Retourner un livre",
        href: "/return-book",
        icon: RotateCcw,
        description: "Restituer vos livres loués",
    },
    {
        title: "Mes livres loués",
        href: "/rented-books",
        icon: Bookmark,
        description: "Vos locations en cours",
    },
    {
        title: "Historique",
        href: "/history",
        icon: History,
        description: "Toutes vos locations",
    },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobile = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { unreadCount } = useMessages();
    const [isRentalDropdownOpen, setIsRentalDropdownOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate("/auth/login");
    };

    const getUserInitials = () => {
        if (!user) return "U";
        return `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase();
    };

    const getUserFullName = () => {
        if (!user) return "Utilisateur";
        return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    };

    const isRentalActive = rentalItems.some((item) => location.pathname === item.href);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <Link to="/home" className="flex items-center gap-2 p-4 h-16 border-b hover:bg-blue-50 transition-colors">
                <Book className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-black bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Bookineo</h1>
            </Link>

            <nav className="flex-1 px-4 py-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                            <li key={item.href}>
                                <Link
                                    to={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 ${
                                        isActive ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium" : "text-foreground"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            </li>
                        );
                    })}

                    <li>
                        <DropdownMenu open={isRentalDropdownOpen} onOpenChange={setIsRentalDropdownOpen}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 ${
                                        isRentalActive ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium" : "text-foreground"
                                    }`}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span className="flex-1 text-left">Locations</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isRentalDropdownOpen ? "rotate-180" : ""}`} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 ml-4 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200" align="start" side="right">
                                <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider">Gestion des locations</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {rentalItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.href;

                                    return (
                                        <DropdownMenuItem
                                            key={item.href}
                                            onClick={() => {
                                                navigate(item.href);
                                                setIsRentalDropdownOpen(false);
                                            }}
                                            className={`cursor-pointer p-3 transition-colors hover:bg-blue-50 focus:bg-blue-50 ${isActive ? "bg-blue-50 border-l-2 border-blue-500" : ""}`}
                                        >
                                            <div className="flex items-start gap-3 w-full">
                                                <Icon className={`h-4 w-4 mt-0.5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${isActive ? "text-blue-900" : "text-gray-900"}`}>{item.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                                </div>
                                            </div>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </li>
                </ul>
            </nav>

            <Separator />

            <div className="p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-black font-bold border border-gray-200">{getUserInitials()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{getUserFullName()}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profil</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => navigate("/my-books")} className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700">
                            <Book className="mr-2 h-4 w-4" />
                            <span>Mes livres</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={() => navigate("/messages")} className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            <span>Messagerie</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Déconnexion</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );

    if (mobile) {
        return (
            <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white lg:hidden">
                <div className="flex items-center gap-2">
                    <Book className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Bookineo</h1>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" className="relative">
                            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
        );
    }

    return (
        <div className="w-64 h-screen border-r bg-white">
            <SidebarContent />
        </div>
    );
};
