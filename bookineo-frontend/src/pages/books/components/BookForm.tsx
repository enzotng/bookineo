import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui";
import type { Book, Category } from "../../../types/book";

const bookSchema = z.object({
    title: z.string().min(1, "Le titre est requis").max(255, "Le titre est trop long"),
    author: z.string().min(1, "L'auteur est requis").max(255, "Le nom de l'auteur est trop long"),
    isbn: z.string().optional(),
    publication_year: z.number().int().min(1000).max(new Date().getFullYear()).optional().or(z.literal("")),
    category_id: z.number().optional().or(z.literal("")),
    price: z.number().min(0, "Le prix doit être positif"),
    status: z.enum(["available", "rented", "unavailable"]).optional(),
    image_url: z.string().url("URL invalide").optional().or(z.literal(""))
});

type BookFormData = z.infer<typeof bookSchema>;

interface BookFormProps {
    categories: Category[];
    initialData?: Book | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ categories, initialData, onSubmit, onCancel }) => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<BookFormData>({
        resolver: zodResolver(bookSchema),
        defaultValues: {
            title: initialData?.title || "",
            author: initialData?.author || "",
            isbn: initialData?.isbn || "",
            publication_year: initialData?.publication_year || "",
            category_id: initialData?.category_id || "",
            price: initialData?.price || 0,
            status: initialData?.status || "available",
            image_url: initialData?.image_url || ""
        }
    });

    const categoryId = watch("category_id");
    const status = watch("status");

    const onFormSubmit = (data: BookFormData) => {
        const processedData = {
            ...data,
            publication_year: data.publication_year || null,
            category_id: data.category_id || null,
            image_url: data.image_url || null
        };
        onSubmit(processedData);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="title">Titre *</Label>
                <input
                    id="title"
                    {...register("title")}
                    className="w-full mt-1 px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Titre du livre"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
                <Label htmlFor="author">Auteur *</Label>
                <input
                    id="author"
                    {...register("author")}
                    className="w-full mt-1 px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="Nom de l'auteur"
                />
                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="isbn">ISBN</Label>
                    <input
                        id="isbn"
                        {...register("isbn")}
                        className="w-full mt-1 px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="978-1234567890"
                    />
                    {errors.isbn && <p className="text-red-500 text-sm mt-1">{errors.isbn.message}</p>}
                </div>

                <div>
                    <Label htmlFor="publication_year">Année de publication</Label>
                    <input
                        id="publication_year"
                        type="number"
                        {...register("publication_year", { valueAsNumber: true })}
                        className="w-full mt-1 px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="2023"
                        min="1000"
                        max={new Date().getFullYear()}
                    />
                    {errors.publication_year && <p className="text-red-500 text-sm mt-1">{errors.publication_year.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Catégorie</Label>
                    <Select
                        value={categoryId ? categoryId.toString() : "none"}
                        onValueChange={(value) => setValue("category_id", value === "none" ? "" : parseInt(value))}
                    >
                        <SelectTrigger className="w-full mt-1 rounded-xl border-gray-200 focus:border-blue-500 shadow-sm bg-white">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Aucune catégorie</SelectItem>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
                </div>

                <div>
                    <Label htmlFor="price">Prix *</Label>
                    <input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register("price", { valueAsNumber: true })}
                        className="w-full mt-1 px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        placeholder="15.99"
                        min="0"
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>
            </div>

            {initialData && (
                <div>
                    <Label>Statut</Label>
                    <Select value={status || "available"} onValueChange={(value) => setValue("status", value as any)}>
                        <SelectTrigger className="w-full mt-1 rounded-xl border-gray-200 focus:border-blue-500 shadow-sm bg-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="available">Disponible</SelectItem>
                            <SelectItem value="rented">Loué</SelectItem>
                            <SelectItem value="unavailable">Indisponible</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                </div>
            )}

            <div>
                <Label htmlFor="image_url">URL de l'image</Label>
                <input
                    id="image_url"
                    type="url"
                    {...register("image_url")}
                    className="w-full mt-1 px-3 py-2 border rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    placeholder="https://example.com/image.jpg"
                />
                {errors.image_url && <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all">
                    {isSubmitting ? "Enregistrement..." : (initialData ? "Modifier" : "Ajouter")}
                </Button>
            </div>
        </form>
    );
};

export default BookForm;