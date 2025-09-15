import React from "react";
import { Button, Avatar, AvatarFallback, Badge } from "../ui";
import { Bell, Search, User } from "lucide-react";

export const Header: React.FC = () => {
    return (
        <header className="border-b bg-white px-6 h-16 flex items-center justify-between">
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher des livres..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative">
                    <Button variant="ghost" size="sm" className="relative">
                        <Bell className="h-5 w-5" />
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                            3
                        </Badge>
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">John Doe</p>
                        <p className="text-xs text-gray-500">john.doe@email.com</p>
                    </div>
                </div>
            </div>
        </header>
    );
};
