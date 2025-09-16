import React from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Login, Register, Home } from "../pages";
import { Books } from "../pages/books";
import { ChatBot } from "../components/chatbot";
import { Layout } from "../components/layout";

const AppRouter: React.FC = () => {
    const isAuthenticated = true;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/auth/login"} replace />} />

                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />

                {isAuthenticated && (
                    <Route path="/*" element={
                        <Layout>
                            <Routes>
                                <Route path="/home" element={<Home />} />
                                <Route path="/books" element={<Books />} />
                            </Routes>
                            <ChatBot />
                        </Layout>
                    } />
                )}

                <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/auth/login"} replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
