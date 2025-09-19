// src/pages/account/Profile.tsx
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Button, Input, Label,
} from "../../components/ui";
import { Loader2, Mail, User, Calendar, Trash2, Edit3, Save, X } from "lucide-react";
import { profileAPI } from "@/api/profile";
import type { UserProfile, UpdateProfileRequest } from "@/types/profile";
import { toast } from "react-toastify";

/* ========= Validation ========= */
const profileSchema = z.object({
  firstName: z.string().min(1, "Prénom obligatoire"),
  lastName: z.string().min(1, "Nom obligatoire"),
  email: z.string().email("Format d'email invalide"),
  birthDate: z.string().refine(v => !Number.isNaN(Date.parse(v)), "Date invalide"),
  notificationsEmail: z.boolean().default(false),
});
type ProfileForm = z.output<typeof profileSchema>;

/* ========= Mapping API <-> Form ========= */
function mapFromApi(p: UserProfile): ProfileForm {
  return {
    firstName: p.first_name ?? "",
    lastName: p.last_name ?? "",
    email: p.email ?? "",
    birthDate: p.birth_date ? p.birth_date.slice(0, 10) : "",
    notificationsEmail: p.newsletter ?? false,
  };
}

function mapToApi(payload: Pick<ProfileForm, "firstName" | "lastName" | "birthDate" | "notificationsEmail">): UpdateProfileRequest {
  return {
    first_name: payload.firstName,
    last_name:  payload.lastName,
    birth_date: payload.birthDate,
    newsletter: payload.notificationsEmail,
  };
}

/* ========= API wrappers ========= */
async function getProfile(): Promise<ProfileForm> {
  const profile = await profileAPI.getProfile();
  return mapFromApi(profile);
}

async function updateProfile(data: Pick<ProfileForm, "firstName" | "lastName" | "birthDate" | "notificationsEmail">) {
  try {
    const body = mapToApi(data);
    const updated = await profileAPI.updateProfile(body);
    return { ok: true, data: mapFromApi(updated) as ProfileForm };
  } catch {
    return { ok: false };
  }
}

async function updateNewsletter(enabled: boolean) {
  try {
    const updated = await profileAPI.updateProfile({ newsletter: enabled });
    return { ok: true, data: mapFromApi(updated) as ProfileForm };
  } catch {
    return { ok: false };
  }
}

async function deleteAccount() {
  try {
    await profileAPI.deleteAccount();
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/* ========= Toggle minimaliste ========= */
function Toggle({
  checked, onChange, disabled,
  ariaLabel = "Activer les notifications par mail",
}: { checked: boolean; onChange: (v: boolean)=>void; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-green-600" : "bg-gray-300"} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

/* ========= Dialog simple (confirmation suppression) ========= */
function ConfirmDelete({ open, onClose, onConfirm, loading }: { open: boolean; onClose: ()=>void; onConfirm: ()=>void; loading?: boolean }) {
  const [txt, setTxt] = React.useState("");
  if (!open) return null;
  const canDelete = txt.trim().toUpperCase() === "SUPPRIMER";
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Supprimer mon compte</h3>
          <p className="text-sm text-gray-600 mb-4">Action irréversible. Tape <span className="font-mono">SUPPRIMER</span> pour confirmer.</p>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmation</Label>
            <Input id="confirm" value={txt} onChange={(e)=>setTxt(e.target.value)} placeholder="SUPPRIMER" />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Annuler</Button>
            <Button variant="destructive" onClick={onConfirm} disabled={!canDelete || loading}>
              {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Suppression…</span> : <span className="inline-flex items-center gap-2"><Trash2 className="h-4 w-4" />Supprimer</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========= Page ========= */
const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [editMode, setEditMode] = React.useState(false);
  const [notifSaving, setNotifSaving] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty, isSubmitting } } =
    useForm<ProfileForm>({
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

  React.useEffect(() => {
    (async () => {
      try {
        const data = await getProfile();
        reset(data);
      } catch {
        toast.error("Impossible de charger votre profil.");
      } finally {
        setLoading(false);
      }
    })();
  }, [reset]);

const onSubmit: SubmitHandler<ProfileForm> = async (values) => {
  const res = await updateProfile({
    firstName: values.firstName,
    lastName: values.lastName,
    birthDate: values.birthDate,
    notificationsEmail: values.notificationsEmail,
  });

  if (res.ok) {
    if (res.data) reset(res.data);
    toast.success("Profil mis à jour.");
    setEditMode(false);
  } else {
    toast.error("Échec de la mise à jour.");
  }
};

const onToggleNotif = async () => {
  setNotifSaving(true);
  const next = !notificationsEmail;
  const res = await updateNewsletter(next);
  if (res.ok) {
    if (res.data) {
      reset(res.data);
    } else {
      setValue("notificationsEmail", next, { shouldDirty: false });
    }
    toast.success(next ? "Newsletter activée." : "Newsletter désactivée.");
  } else {
    toast.error("Échec de la mise à jour des notifications.");
  }
  setNotifSaving(false);
};

const { logout } = useAuth();
const onConfirmDelete = async () => {
  setDeleting(true);
  const res = await deleteAccount();
  setDeleting(false);

  if (res.ok) {
    logout();
    setDeleteOpen(false);
    navigate("/auth/login", { replace: true });
    toast.success("Compte supprimé.");
  } else {
    toast.error("La suppression du compte a échoué.");
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <span className="inline-flex items-center gap-2 text-gray-600"><Loader2 className="h-5 w-5 animate-spin" />Chargement…</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-sm text-muted-foreground">Gérez vos informations et vos préférences de notifications.</p>
        </div>
      </div>

      {/* Grid 2 colonnes */}
      <div className="container mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-3">
        {/* Colonne gauche */}
        <div className="md:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                {initials || "U"}
              </div>
              <div>
                <CardTitle className="text-xl">{watch("firstName")} {watch("lastName")}</CardTitle>
                <CardDescription>{watch("email")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {!editMode ? (
                <Button className="w-full" onClick={() => setEditMode(true)}>
                  <span className="inline-flex items-center gap-2"><Edit3 className="h-4 w-4" /> Modifier</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={async () => {
                    try {
                      const data = await getProfile();
                      reset(data);
                      toast.info("Modifications annulées.");
                    } finally {
                      setEditMode(false);
                    }
                  }}
                >
                  <span className="inline-flex items-center gap-2"><X className="h-4 w-4" /> Annuler</span>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <div className="md:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Nom, prénom, email et date de naissance.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="inline-flex items-center gap-2"><User className="h-4 w-4" /> Nom</Label>
                    <Input id="lastName" disabled={!editMode} {...register("lastName")} />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="inline-flex items-center gap-2"><User className="h-4 w-4" /> Prénom</Label>
                    <Input id="firstName" disabled={!editMode} {...register("firstName")} />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> Email</Label>
                  <Input id="email" type="email" disabled={!editMode} {...register("email")} />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" /> Date de naissance</Label>
                  <Input id="birthDate" type="date" disabled={!editMode} {...register("birthDate")} />
                  {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
                </div>

                <div className="flex items-center gap-2">
                  {!editMode ? (
                    <Button type="button" onClick={() => setEditMode(true)}><Edit3 className="h-4 w-4 mr-2" />Modifier</Button>
                  ) : (
                    <>
                      <Button type="submit" disabled={isSubmitting || !isDirty}>
                        {isSubmitting ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Enregistrement…</span> : <span className="inline-flex items-center gap-2"><Save className="h-4 w-4" />Enregistrer</span>}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={async () => {
                          const data = await getProfile();
                          reset(data);
                          toast.info("Modifications annulées.");
                          setEditMode(false);
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />Annuler
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium">Activer la newsletter et les notifications</p>
                <p className="text-sm text-muted-foreground">Emprunts, retours, retards et nouveautés.</p>
              </div>
              <div className="flex items-center gap-3">
                {notifSaving && <Loader2 className="h-4 w-4 animate-spin text-gray-500" />}
                <Toggle checked={!!notificationsEmail} onChange={onToggleNotif} disabled={notifSaving} />
              </div>
            </CardContent>
          </Card>

          {/* Zone de danger */}
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
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog suppression */}
      <ConfirmDelete open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={onConfirmDelete} loading={deleting} />
    </div>
  );
};

export default Profile;
