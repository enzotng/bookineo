export interface Book {
    id: string;
    isbn: string;
    title: string;
    author: string;
    publication_year: number;
    category_id: number;
    price: number;
    status: string;
    owner_id: string;
    created_at: Date;
    updated_at: Date;
    image_url: string | null;
}
