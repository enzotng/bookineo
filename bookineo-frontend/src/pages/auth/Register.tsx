import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "../../components/ui";
import { Eye, EyeOff } from "lucide-react";
import { AuthBackground } from "../../components/auth";

const registerSchema = z
    .object({
        email: z.string().email("Format d'email invalide"),
        password: z
            .string()
            .min(8, "Au moins 8 caractères")
            .regex(/[A-Z]/, "Au moins une majuscule")
            .regex(/[a-z]/, "Au moins une minuscule")
            .regex(/[!@#$%^&*(),.?\":{}|<>]/, "Au moins un caractère spécial"),
        confirmPassword: z.string(),
        firstName: z.string().min(1, "Le prénom est obligatoire"),
        lastName: z.string().min(1, "Le nom est obligatoire"),
        birthDate: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirmPassword"],
    });

type RegisterForm = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [error, setError] = React.useState("");
    const navigate = useNavigate();
    const { register: authRegister } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            setError("");
            await authRegister({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                birthDate: data.birthDate,
            });
            navigate("/home");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erreur d'inscription";
            setError(errorMessage);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-baby-powder-700 via-baby-powder-600 to-baby-powder-800 overflow-hidden flex items-center justify-center p-4">
            <Card className="bg-baby-powder-900/95 backdrop-blur-lg border-0 shadow-2xl w-full max-w-md mx-auto z-30">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-black mb-2">
                        Book<span className="bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent">ineo</span>
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">Créez votre compte</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{error}</div>}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Prénom</Label>
                                <Input id="firstName" {...register("firstName")} />
                                {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Nom</Label>
                                <Input id="lastName" {...register("lastName")} />
                                {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register("email")} />
                            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birthDate">Date de naissance</Label>
                            <Input id="birthDate" type="date" {...register("birthDate")} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} />
                                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                            <div className="relative">
                                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...register("confirmPassword")} />
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

                        <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all" disabled={isSubmitting}>
                            {isSubmitting ? "Inscription..." : "S'inscrire"}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Déjà un compte ? </span>
                            <Link to="/auth/login" className="text-blue-600 hover:underline font-medium">
                                Se connecter
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <AuthBackground type="register" />
        </div>
    );
};

export default Register;
