import React from "react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Label } from "../../../components/ui";
import { Filter, X, CheckCircle, Search, Clock, Eye } from "lucide-react";
import type { MessageFilters } from "../../../types/message";
import { toast } from "react-toastify";

interface MessageFiltersProps {
    filters: MessageFilters;
    onFiltersChange: (filters: MessageFilters) => void;
    onMarkAllAsRead: () => void;
    unreadCount: number;
}

export const MessageFiltersComponent: React.FC<MessageFiltersProps> = ({ filters, onFiltersChange, onMarkAllAsRead, unreadCount }) => {
    const handleFilterChange = (key: keyof MessageFilters, value: string | boolean) => {
        onFiltersChange({
            ...filters,
            [key]: value === "" ? undefined : value,
        });
    };

    const clearFilters = () => {
        onFiltersChange({});
        toast.info("🔄 Filtres effacés");
    };

    const handleMarkAllAsRead = async () => {
        try {
            await onMarkAllAsRead();
            toast.success(`✅ ${unreadCount} message${unreadCount > 1 ? 's' : ''} marqué${unreadCount > 1 ? 's' : ''} comme lu${unreadCount > 1 ? 's' : ''}`);
        } catch (error) {
            toast.error("❌ Erreur lors du marquage des messages");
        }
    };

    const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== "");

    return (
        <div className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Filter className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Filtres</h3>
                        <div className="text-sm text-gray-500">Affinez votre recherche</div>
                    </div>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg border border-red-200"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Effacer filtres
                        </Button>
                    )}
                </div>

                {unreadCount > 0 && (
                    <Button
                        onClick={handleMarkAllAsRead}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all rounded-xl"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Tout marquer lu ({unreadCount})
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <Label htmlFor="search-filter" className="text-sm font-medium text-gray-700">
                            Recherche
                        </Label>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            id="search-filter"
                            placeholder="Rechercher dans les messages..."
                            value={filters.search || ""}
                            onChange={(e) => handleFilterChange("search", e.target.value)}
                            className="pl-10 rounded-xl border-gray-200 focus:border-blue-500 shadow-sm"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <Label className="text-sm font-medium text-gray-700">Statut</Label>
                    </div>
                    <Select
                        value={filters.unreadOnly ? "unread" : "all"}
                        onValueChange={(value) => handleFilterChange("unreadOnly", value === "unread")}
                    >
                        <SelectTrigger className="rounded-xl border-gray-200 focus:border-blue-500 shadow-sm bg-white">
                            <SelectValue placeholder="Tous les messages" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                            <SelectItem value="all" className="rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                    Tous les messages
                                </div>
                            </SelectItem>
                            <SelectItem value="unread" className="rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    Non lus seulement
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <Label className="text-sm font-medium text-gray-700">Période</Label>
                    </div>
                    <Select
                        value={
                            filters.dateFrom === new Date().toISOString().split("T")[0]
                                ? "today"
                                : filters.dateFrom === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                                ? "week"
                                : filters.dateFrom === new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                                ? "month"
                                : "all"
                        }
                        onValueChange={(value) => {
                            let dateFrom: string | undefined = undefined;
                            const now = new Date();

                            if (value === "today") {
                                dateFrom = now.toISOString().split("T")[0];
                            } else if (value === "week") {
                                dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                            } else if (value === "month") {
                                dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
                            }

                            handleFilterChange("dateFrom", dateFrom || "");
                        }}
                    >
                        <SelectTrigger className="rounded-xl border-gray-200 focus:border-blue-500 shadow-sm bg-white">
                            <SelectValue placeholder="Toute période" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                            <SelectItem value="all" className="rounded-lg">Toute période</SelectItem>
                            <SelectItem value="today" className="rounded-lg">Aujourd'hui</SelectItem>
                            <SelectItem value="week" className="rounded-lg">Cette semaine</SelectItem>
                            <SelectItem value="month" className="rounded-lg">Ce mois</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                        {Object.entries(filters).filter(([, value]) => value !== undefined && value !== "").length} filtre(s) actif(s)
                    </div>
                </div>
            )}
        </div>
    );
};
