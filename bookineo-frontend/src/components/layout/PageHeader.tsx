import React from "react";
import { Badge } from "../ui";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: {
        text: string;
        className?: string;
    };
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    badge,
    actions
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-black text-foreground leading-tight">{title}</h1>
                    <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</div>
                </div>
                {badge && (
                    <Badge className={`text-xs sm:text-sm flex-shrink-0 ${badge.className || "bg-emerald-100 text-emerald-800 border-emerald-300"}`}>
                        {badge.text}
                    </Badge>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {actions}
                </div>
            )}
        </div>
    );
};