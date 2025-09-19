import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "../../components/ui";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { AuthBackground } from "../../components/auth";

const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Au moins 8 caractères")
        .regex(/[A-Z]/, "Au moins une majuscule")
        .regex(/[a-z]/, "Au moins une minuscule")
        .regex(/[!@#$%^&*(),.?\":{}|<>]/, "Au moins un caractère spécial"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"]
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);

    const token = searchParams.get("token");

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema)
    });

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            return;
        }
        setTokenValid(true);
    }, [token]);

    const onSubmit = async (data: ResetPasswordForm) => {
        try {
            setError("");
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token,
                    newPassword: data.password
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erreur lors de la réinitialisation");
            }

            setSuccess(true);
            setTimeout(() => {
                navigate("/auth/login");
            }, 3000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erreur lors de la réinitialisation";
            setError(errorMessage);
        }
    };

    const requestNewReset = () => {
        navigate("/auth/forgot-password");
    };

    if (tokenValid === false) {
        return (
            <div className="relative min-h-screen bg-gradient-to-br from-baby-powder-700 via-baby-powder-600 to-baby-powder-800 overflow-hidden flex items-center justify-center p-4">
                <Card className="bg-baby-powder-900/95 backdrop-blur-lg border-0 shadow-2xl w-full max-w-md mx-auto z-30">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Lien invalide</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Ce lien de réinitialisation est invalide ou a expiré
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-gray-600">
                                Les liens de réinitialisation expirent après 1 heure pour votre sécurité.
                            </p>
                            <Button
                                onClick={requestNewReset}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                            >
                                Demander un nouveau lien
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <AuthBackground type="reset" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="relative min-h-screen bg-gradient-to-br from-baby-powder-700 via-baby-powder-600 to-baby-powder-800 overflow-hidden flex items-center justify-center p-4">
                <Card className="bg-baby-powder-900/95 backdrop-blur-lg border-0 shadow-2xl w-full max-w-md mx-auto z-30">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Mot de passe réinitialisé !</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Votre mot de passe a été mis à jour avec succès
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-4">
                                Vous allez être redirigé vers la page de connexion...
                            </p>
                            <Button
                                onClick={() => navigate("/auth/login")}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                            >
                                Se connecter maintenant
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <AuthBackground type="success" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-baby-powder-700 via-baby-powder-600 to-baby-powder-800 overflow-hidden flex items-center justify-center p-4">
            <Card className="bg-baby-powder-900/95 backdrop-blur-lg border-0 shadow-2xl w-full max-w-md mx-auto z-30">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-black mb-2">
                        Book<span className="bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">ineo</span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Choisissez votre nouveau mot de passe
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Nouveau mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("confirmPassword")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Mise à jour..." : "Réinitialiser le mot de passe"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <AuthBackground type="reset" />
        </div>
    );
};

export default ResetPassword;