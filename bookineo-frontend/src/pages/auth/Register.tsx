import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components";

const Register: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Bookineo</CardTitle>
                    <CardDescription>
                        Créez votre compte
                    </CardDescription>
                </CardHeader>
                <CardContent>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;