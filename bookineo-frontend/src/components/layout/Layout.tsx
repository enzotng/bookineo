import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useSocket } from "../../hooks/useSocket";

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    useSocket();

    return (
        <>
            <aside className="hidden md:block fixed left-0 top-0 h-screen z-40">
                <Sidebar />
            </aside>

            <div className="hidden md:block ml-64">
                <header className="fixed top-0 left-64 right-0 z-30">
                    <Header />
                </header>
                <main className="bg-gray-50 p-6 pt-20 h-full overflow-y-auto">
                    {children}
                </main>
            </div>

            <div className="md:hidden">
                <div className="fixed top-0 left-0 right-0 z-50">
                    <Sidebar mobile />
                </div>
                <main className="bg-gray-50 p-6 pt-20 h-full overflow-y-auto">
                    {children}
                </main>
            </div>
        </>
    );
};
