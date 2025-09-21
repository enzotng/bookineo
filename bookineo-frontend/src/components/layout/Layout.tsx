import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useSocket } from "../../hooks/useSocket";

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    useSocket();

    return (
        <div className="min-h-screen bg-background flex">
            <div className="hidden md:block fixed left-0 top-0 h-screen z-40">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col md:ml-64">
                <Header />

                <main className="flex-1 p-6 min-h-[calc(100vh-4rem)] mt-16">{children}</main>
            </div>
        </div>
    );
};
