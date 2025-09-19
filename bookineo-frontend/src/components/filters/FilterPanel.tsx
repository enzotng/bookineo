import React from "react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input, Label } from "../ui";
import { Filter, X, Search } from "lucide-react";

export interface FilterConfig {
    key: string;
    type: "text" | "select" | "search" | "date" | "checkbox";
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    placeholder?: string;
    options?: { value: string; label: string; icon?: React.ReactNode }[];
}

interface FilterPanelProps {
    title?: string;
    subtitle?: string;
    filters: Record<string, any>;
    onFiltersChange: (filters: Record<string, any>) => void;
    filterConfigs: FilterConfig[];
    customActions?: React.ReactNode[];
    onClearFilters?: () => void;
    showFilterCount?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
    title = "Filtres",
    subtitle = "Affinez votre recherche",
    filters,
    onFiltersChange,
    filterConfigs,
    customActions = [],
    onClearFilters,
    showFilterCount = true,
}) => {
    const handleFilterChange = (key: string, value: string | boolean | undefined) => {
        onFiltersChange({
            ...filters,
            [key]: value === "" || value === "all" ? undefined : value,
        });
    };

    const clearFilters = () => {
        const clearedFilters = Object.keys(filters).reduce((acc, key) => {
            acc[key] = undefined;
            return acc;
        }, {} as Record<string, any>);
        onFiltersChange(clearedFilters);
        onClearFilters?.();
    };

    const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== "" && value !== "all");

    const getGridClasses = () => {
        const filterCount = filterConfigs.length;
        if (filterCount === 1) return "grid grid-cols-1 gap-6";
        if (filterCount === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-6";
        if (filterCount === 3) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
        if (filterCount === 4) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";
        if (filterCount === 5) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6";
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6";
    };

    const renderFilter = (config: FilterConfig) => {
        const { key, type, label, icon: Icon, placeholder, options } = config;

        return (
            <div key={key} className="space-y-3">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                    <Label className="text-sm font-medium text-gray-700">{label}</Label>
                </div>

                {type === "search" && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder={placeholder}
                            value={filters[key] || ""}
                            onChange={(e) => handleFilterChange(key, e.target.value)}
                            className="pl-10 rounded-xl border-gray-200 focus:border-blue-500 shadow-sm"
                        />
                    </div>
                )}

                {type === "text" && (
                    <Input
                        placeholder={placeholder}
                        value={filters[key] || ""}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        className="rounded-xl border-gray-200 focus:border-blue-500 shadow-sm"
                    />
                )}

                {type === "select" && options && (
                    <Select value={filters[key] || "all"} onValueChange={(value) => handleFilterChange(key, value)}>
                        <SelectTrigger className="rounded-xl border-gray-200 focus:border-blue-500 shadow-sm bg-white">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-200 shadow-xl">
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="rounded-lg">
                                    {option.icon ? (
                                        <div className="flex items-center gap-2">
                                            {option.icon}
                                            {option.label}
                                        </div>
                                    ) : (
                                        option.label
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                {type === "date" && (
                    <Input
                        type="date"
                        placeholder={placeholder}
                        value={filters[key] || ""}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        className="rounded-xl border-gray-200 focus:border-blue-500 shadow-sm"
                    />
                )}

                {type === "checkbox" && (
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={key}
                            checked={filters[key] || false}
                            onChange={(e) => handleFilterChange(key, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={key} className="text-sm text-gray-700 cursor-pointer">
                            {placeholder || label}
                        </label>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Filter className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                        <div className="text-sm text-gray-500">{subtitle}</div>
                    </div>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg border border-red-200">
                            <X className="w-4 h-4 mr-2" />
                            Effacer filtres
                        </Button>
                    )}
                </div>

                {customActions.length > 0 && <div className="flex items-center gap-2">{customActions}</div>}
            </div>

            <div className={getGridClasses()}>{filterConfigs.map(renderFilter)}</div>

            {hasActiveFilters && showFilterCount && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">{Object.entries(filters).filter(([, value]) => value !== undefined && value !== "" && value !== "all").length} filtre(s) actif(s)</div>
                </div>
            )}
        </div>
    );
};
