import React from "react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Label } from "../../../components/ui";
import { Filter, X, CheckCircle } from "lucide-react";
import type { MessageFilters } from "../../../types/message";

interface MessageFiltersProps {
    filters: MessageFilters;
    onFiltersChange: (filters: MessageFilters) => void;
    onMarkAllAsRead: () => void;
    unreadCount: number;
}

export const MessageFiltersComponent: React.FC<MessageFiltersProps> = ({
    filters,
    onFiltersChange,
    onMarkAllAsRead,
    unreadCount,
}) => {
    const handleFilterChange = (key: keyof MessageFilters, value: string | boolean) => {
        onFiltersChange({
            ...filters,
            [key]: value === "" ? undefined : value,
        });
    };

    const clearFilters = () => {
        onFiltersChange({});
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== "");

    return (
        <div className="p-4 border-b bg-white space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Filtres</span>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-3 h-3 mr-1" />
                            Effacer
                        </Button>
                    )}
                </div>

                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onMarkAllAsRead}
                        className="flex items-center space-x-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span>Tout marquer lu ({unreadCount})</span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="search-filter" className="text-xs">Recherche</Label>
                    <Input
                        id="search-filter"
                        placeholder="Rechercher dans les messages..."
                        value={filters.search || ""}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="h-8 text-sm"
                    />
                </div>

                <div>
                    <Label className="text-xs">Statut</Label>
                    <Select
                        value={filters.unreadOnly ? "unread" : "all"}
                        onValueChange={(value) => handleFilterChange("unreadOnly", value === "unread")}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Tous les messages" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les messages</SelectItem>
                            <SelectItem value="unread">Non lus seulement</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-xs">Période</Label>
                    <Select
                        value={
                            filters.dateFrom === new Date().toISOString().split('T')[0] ? "today" :
                            filters.dateFrom === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "week" :
                            filters.dateFrom === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ? "month" :
                            "all"
                        }
                        onValueChange={(value) => {
                            let dateFrom: string | undefined = undefined;
                            const now = new Date();

                            if (value === "today") {
                                dateFrom = now.toISOString().split('T')[0];
                            } else if (value === "week") {
                                dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                            } else if (value === "month") {
                                dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                            }

                            handleFilterChange("dateFrom", dateFrom || "");
                        }}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Toute période" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toute période</SelectItem>
                            <SelectItem value="today">Aujourd'hui</SelectItem>
                            <SelectItem value="week">Cette semaine</SelectItem>
                            <SelectItem value="month">Ce mois</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};