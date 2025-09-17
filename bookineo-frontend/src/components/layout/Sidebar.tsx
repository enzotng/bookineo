import React from "react";
import { Sheet, SheetContent, SheetTrigger, Button, Separator } from "../ui";
import { Menu, Home, Book, MessageSquare, User, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
        title: "Mes livres",
        href: "/my-books",
        icon: Book,
    },
    {
        title: "Messages",
        href: "/messages",
        icon: MessageSquare,
    },
    {
        title: "Profil",
        href: "/profile",
        icon: User,
    },
    {
        title: "Paramètres",
        href: "/settings",
        icon: Settings,
    },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobile = false }) => {
    const location = useLocation();

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-4 h-16 border-b">
                <Book className="h-8 w-8 text-blue-600" />
                <h1 className="text-xl font-bold">Bookineo</h1>
            </div>

            <nav className="flex-1 px-4 py-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                            <li key={item.href}>
                                <Link
                                    to={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-100 ${
                                        isActive ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <Separator />

            <div className="p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                        // Logique de déconnexion
                        console.log("Logout clicked");
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                </Button>
            </div>
        </div>
    );

    if (mobile) {
        return (
            <div className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center gap-2">
                    <Book className="h-6 w-6 text-blue-600" />
                    <h1 className="text-lg font-bold">Bookineo</h1>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
        );
    }

    return (
        <div className="w-64 h-full border-r bg-white">
            <SidebarContent />
        </div>
    );
};
