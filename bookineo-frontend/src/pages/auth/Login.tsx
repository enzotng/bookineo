import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/card";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Label } from "../../components/label";
import { Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [rememberMe, setRememberMe] = React.useState(false);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Bookineo</CardTitle>
                    <CardDescription>Connectez-vous à votre compte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="prenom.nom@domaine.com" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Mot de passe</Label>
                        <div className="relative">
                            <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required />
                            <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="remember" className="rounded border-gray-300" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                        <Label htmlFor="remember" className="text-sm font-normal">
                            Remember me
                        </Label>
                    </div>

                    <Button className="w-full">Se connecter</Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Pas encore de compte ? </span>
                        <a href="/auth/register" className="text-blue-600 hover:underline">
                            Créer un compte
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
