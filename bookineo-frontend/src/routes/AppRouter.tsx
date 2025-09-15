import React from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Login, Register, Home } from "../pages";
import { ChatBot } from "../components/chatbot";

const AppRouter: React.FC = () => {
    const isAuthenticated = true;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/auth/login"} replace />} />

                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />

                {isAuthenticated && <Route path="/home" element={<Home />} />}

                <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/auth/login"} replace />} />
            </Routes>

            {isAuthenticated && <ChatBot />}
        </BrowserRouter>
    );
};

export default AppRouter;
