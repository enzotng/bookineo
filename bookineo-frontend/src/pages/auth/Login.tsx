import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Checkbox } from "../../components/ui";
import { Eye, EyeOff } from "lucide-react";
import { AuthBackground } from "../../components/auth";

const loginSchema = z.object({
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(1, "Mot de passe obligatoire"),
    rememberMe: z.union([z.boolean(), z.string()]).transform(val => val === true || val === "true" || val === "on").optional()
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    });


    const onSubmit = async (data: LoginForm) => {
        console.log("onSubmit called with:", data);
        try {
            setError("");
            await login(data);
            navigate("/home");
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error instanceof Error ? error.message : "Erreur de connexion";
            setError(errorMessage);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-baby-powder-700 via-baby-powder-600 to-baby-powder-800 overflow-hidden flex items-center justify-center p-4">
            <Card className="bg-baby-powder-900/95 backdrop-blur-lg border-0 shadow-2xl w-full max-w-md mx-auto relative z-[100]">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-black mb-2">
                        Book<span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">ineo</span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Connectez-vous à votre compte</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="bg-bistre-900/50 border border-bistre-600 text-bistre-600 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="prenom.nom@domaine.com"
                                {...register("email")}
                            />
                            {errors.email && <p className="text-bistre-600 text-sm">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
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
                            {errors.password && <p className="text-bistre-600 text-sm">{errors.password.message}</p>}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="remember" {...register("rememberMe")} />
                            <Label htmlFor="remember" className="text-sm font-normal">
                                Se souvenir de moi
                            </Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Connexion..." : "Se connecter"}
                        </Button>

                        <div className="text-center text-sm space-y-2">
                            <div>
                                <Link to="/auth/forgot-password" className="text-blue-600 hover:underline font-medium">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Pas encore de compte ? </span>
                                <Link to="/auth/register" className="text-blue-600 hover:underline font-medium">
                                    Créer un compte
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <AuthBackground type="login" />
        </div>
    );
};

export default Login;