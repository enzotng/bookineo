import React from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import { Login, Register } from "../pages";

const AppRouter: React.FC = () => {
    const isAuthenticated = false;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/auth/login"} replace />} />

                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />

                {isAuthenticated && <Route path="/home" element={<div>Home Page - Coming Soon</div>} />}

                <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/auth/login"} replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
