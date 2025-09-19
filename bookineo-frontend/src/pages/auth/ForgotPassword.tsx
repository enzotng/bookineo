import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "../../components/ui";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { AuthBackground } from "../../components/auth";

const forgotPasswordSchema = z.object({
    email: z.string().email("Format d'email invalide"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordForm>({
        resolver: zodResolver(forgotPasswordSchema)
    });

    const onSubmit = async (data: ForgotPasswordForm) => {
        try {
            setError("");
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/request-password-reset`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: data.email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Erreur lors de l'envoi");
            }

            setSuccess(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'envoi";
            setError(errorMessage);
        }
    };

    if (success) {
        return (
            <div className="relative min-h-screen bg-gradient-to-br from-baby-powder-700 via-baby-powder-600 to-baby-powder-800 overflow-hidden flex items-center justify-center p-4">
                <Card className="bg-baby-powder-900/95 backdrop-blur-lg border-0 shadow-2xl w-full max-w-md mx-auto z-30">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Email envoyé !</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Vérifiez votre boîte de réception
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-gray-600">
                                Si votre email existe dans notre base de données, vous recevrez un lien de réinitialisation dans quelques minutes.
                            </p>
                            <p className="text-xs text-gray-500">
                                Le lien expire dans 1 heure pour votre sécurité.
                            </p>
                            <div className="pt-4">
                                <Link to="/auth/login">
                                    <Button variant="outline" className="w-full">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Retour à la connexion
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <AuthBackground type="forgot" />
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
                        Mot de passe oublié ? Pas de problème !
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
                            <Label htmlFor="email">Adresse email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="prenom.nom@domaine.com"
                                    className="pl-10"
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Vous vous souvenez de votre mot de passe ? </span>
                            <Link to="/auth/login" className="text-blue-600 hover:underline font-medium">
                                Se connecter
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <AuthBackground type="forgot" />
        </div>
    );
};

export default ForgotPassword;