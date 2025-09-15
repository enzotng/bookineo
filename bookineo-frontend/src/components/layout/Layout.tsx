import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <Sidebar>
                <div className="flex flex-col flex-1 min-h-0">
                    <Header />
                    <main className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </div>
            </Sidebar>
        </div>
    );
};