import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Spinner } from "../../components/ui";
import { PageHeader } from "../../components/layout";
import { Loader2, Mail, User, Calendar, Trash2, Edit3, Save, X } from "lucide-react";
import { profileAPI } from "@/api/profile";
import type { UserProfile, UpdateProfileRequest } from "@/types/profile";
import { toast } from "react-toastify";

const profileSchema = z.object({
    firstName: z.string().min(1, "Prénom obligatoire"),
    lastName: z.string().min(1, "Nom obligatoire"),
    email: z.string().email("Format d'email invalide"),
    birthDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Date invalide"),
    notificationsEmail: z.boolean().default(false),
});

type ProfileForm = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loading, setLoading] = React.useState(true);
    const [editMode, setEditMode] = React.useState(false);
    const [notifSaving, setNotifSaving] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [deleteText, setDeleteText] = React.useState("");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            birthDate: "",
            notificationsEmail: false,
        },
    });

    const notificationsEmail = watch("notificationsEmail");
    const initials = ((watch("firstName")?.[0] || "") + (watch("lastName")?.[0] || "")).toUpperCase();

    const mapFromApi = React.useCallback((p: UserProfile): ProfileForm => ({
        firstName: p.first_name ?? "",
        lastName: p.last_name ?? "",
        email: p.email ?? "",
        birthDate: p.birth_date ? p.birth_date.slice(0, 10) : "",
        notificationsEmail: (p as any).notifications_email ?? false,
    }), []);

    const mapToApi = React.useCallback((payload: Omit<ProfileForm, "notificationsEmail">): UpdateProfileRequest => ({
        first_name: payload.firstName,
        last_name: payload.lastName,
        birth_date: payload.birthDate,
    }), []);

    const loadProfile = React.useCallback(async () => {
        try {
            const profile = await profileAPI.getProfile();
            const data = mapFromApi(profile);
            reset(data);
        } catch {
            toast.error("Impossible de charger votre profil.");
        } finally {
            setLoading(false);
        }
    }, [reset, mapFromApi]);

    React.useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const onSubmit: SubmitHandler<ProfileForm> = async (values) => {
        const { notificationsEmail: _ignore, ...payload } = values;
        try {
            const body = mapToApi(payload);
            const updated = await profileAPI.updateProfile(body);
            const data = mapFromApi(updated);
            reset(data);
            toast.success("Profil mis à jour.");
            setEditMode(false);
        } catch {
            toast.error("Échec de la mise à jour.");
        }
    };

    const toggleNotifications = async () => {
        setNotifSaving(true);
        const next = !notificationsEmail;
        try {
            await profileAPI.updateEmailNotifications(next);
            setValue("notificationsEmail", next, { shouldDirty: false });
            toast.success(next ? "Notifications activées." : "Notifications désactivées.");
        } catch {
            toast.error("Échec de la mise à jour des notifications.");
        }
        setNotifSaving(false);
    };

    const confirmDelete = async () => {
        setDeleting(true);
        try {
            await profileAPI.deleteAccount();
            logout();
            setDeleteOpen(false);
            navigate("/auth/login", { replace: true });
            toast.success("Compte supprimé.");
        } catch {
            toast.error("La suppression du compte a échoué.");
        }
        setDeleting(false);
    };

    const cancelEdit = async () => {
        try {
            const profile = await profileAPI.getProfile();
            const data = mapFromApi(profile);
            reset(data);
            toast.info("Modifications annulées.");
        } finally {
            setEditMode(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Spinner size="md" />
            </div>
        );
    }

    const canDelete = deleteText.trim().toUpperCase() === "SUPPRIMER";

    return (
        <div className="w-full h-full flex flex-col gap-4 rounded-lg">
            <PageHeader title="Profil" subtitle="Gérez vos informations et vos préférences de notifications" icon={User} />

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 flex items-center justify-center font-bold">
                                {initials || "U"}
                            </div>
                            <div>
                                <CardTitle className="text-xl">
                                    {watch("firstName")} {watch("lastName")}
                                </CardTitle>
                                <CardDescription>{watch("email")}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!editMode ? (
                                <Button
                                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                                    onClick={() => setEditMode(true)}
                                >
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Modifier
                                </Button>
                            ) : (
                                <Button variant="ghost" className="w-full" onClick={cancelEdit}>
                                    <X className="h-4 w-4 mr-2" />
                                    Annuler
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations personnelles</CardTitle>
                            <CardDescription>Nom, prénom, email et date de naissance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="inline-flex items-center gap-2">
                                            <User className="h-4 w-4" /> Nom
                                        </Label>
                                        <Input id="lastName" disabled={!editMode} {...register("lastName")} />
                                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="inline-flex items-center gap-2">
                                            <User className="h-4 w-4" /> Prénom
                                        </Label>
                                        <Input id="firstName" disabled={!editMode} {...register("firstName")} />
                                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="inline-flex items-center gap-2">
                                        <Mail className="h-4 w-4" /> Email
                                    </Label>
                                    <Input id="email" type="email" disabled={!editMode} {...register("email")} />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="birthDate" className="inline-flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Date de naissance
                                    </Label>
                                    <Input id="birthDate" type="date" disabled={!editMode} {...register("birthDate")} />
                                    {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
                                </div>

                                <div className="flex items-center gap-2">
                                    {!editMode ? (
                                        <Button
                                            type="button"
                                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                                            onClick={() => setEditMode(true)}
                                        >
                                            <Edit3 className="h-4 w-4 mr-2" />
                                            Modifier
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                type="submit"
                                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                                                disabled={isSubmitting || !isDirty}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Enregistrement…
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Enregistrer
                                                    </>
                                                )}
                                            </Button>
                                            <Button type="button" variant="ghost" onClick={cancelEdit}>
                                                <X className="h-4 w-4 mr-2" />
                                                Annuler
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Activer les notifications par mail.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Notifications par mail</p>
                                <p className="text-sm text-muted-foreground">Emprunts, retours, retards et nouveautés.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {notifSaving && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                                <button
                                    type="button"
                                    aria-label="Activer les notifications par mail"
                                    onClick={toggleNotifications}
                                    disabled={notifSaving}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                        notificationsEmail ? "bg-gradient-to-r from-blue-500 to-purple-600" : "bg-gray-300"
                                    } ${notifSaving ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                            notificationsEmail ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-600">Zone de danger</CardTitle>
                            <CardDescription>Action irréversible.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-start justify-between gap-4">
                            <div>
                                <p className="font-medium">Supprimer mon compte</p>
                                <p className="text-sm text-muted-foreground">Toutes vos données Bookineo seront supprimées.</p>
                            </div>
                            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {deleteOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-red-600 mb-2">Supprimer mon compte</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Action irréversible. Tape <span className="font-mono">SUPPRIMER</span> pour confirmer.
                            </p>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirmation</Label>
                                <Input
                                    id="confirm"
                                    value={deleteText}
                                    onChange={(e) => setDeleteText(e.target.value)}
                                    placeholder="SUPPRIMER"
                                />
                            </div>
                            <div className="mt-6 flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                                    Annuler
                                </Button>
                                <Button variant="destructive" onClick={confirmDelete} disabled={!canDelete || deleting}>
                                    {deleting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Suppression…
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Supprimer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;