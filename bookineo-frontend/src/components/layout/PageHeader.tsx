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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-foreground">{title}</h1>
                    <div className="text-sm text-muted-foreground">{subtitle}</div>
                </div>
                {badge && (
                    <Badge className={badge.className || "bg-emerald-100 text-emerald-800 border-emerald-300"}>
                        {badge.text}
                    </Badge>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
};