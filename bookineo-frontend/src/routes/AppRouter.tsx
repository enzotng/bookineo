import React from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../components/auth/AuthProvider";
import { useAuth } from "../hooks/useAuth";
import { Login, Register, Home } from "../pages";
import { Books, MyBooks, RentedBooks, BookDetails } from "../pages/books";
import Messages from "../pages/messages";
import { RentalHistory } from "../pages/history";
import { ReturnBook } from "../pages/rentals";
import { ChatBot } from "../components/chatbot";
import { Layout } from "../components/layout";
import { Spinner } from "../components/ui";

const AppRoutes: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="md" />
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/auth/login"} replace />} />

            {!isAuthenticated ? (
                <>
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/auth/login" replace />} />
                </>
            ) : (
                <Route path="/*" element={
                    <Layout>
                        <Routes>
                            <Route path="/home" element={<Home />} />
                            <Route path="/books" element={<Books />} />
                            <Route path="/books/:id" element={<BookDetails />} />
                            <Route path="/my-books" element={<MyBooks />} />
                            <Route path="/rented-books" element={<RentedBooks />} />
                            <Route path="/return-book" element={<ReturnBook />} />
                            <Route path="/history" element={<RentalHistory />} />
                            <Route path="/messages" element={<Messages />} />
                            <Route path="/messages/:conversationId" element={<Messages />} />
                            <Route path="*" element={<Navigate to="/home" replace />} />
                        </Routes>
                        <ChatBot />
                    </Layout>
                } />
            )}
        </Routes>
    );
};

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default AppRouter;
