export interface Book {
    id: string;
    title: string;
    author: string;
    isbn: string;
    publication_year?: number;
    category_id?: number;
    price: number;
    status: 'available' | 'rented' | 'unavailable';
    owner_id: number;
    image_url?: string;
    description?: string;
    first_name?: string;
    last_name?: string;
    owner_email?: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface BookWithCategory extends Book {
    category?: Category;
}

export interface BookFilters {
    status?: string;
    category_id?: number;
    author?: string;
    title?: string;
    page?: number;
    limit?: number;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalBooks: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface BooksResponse {
    books: Book[];
    pagination: PaginationInfo;
}

export interface CreateBookRequest {
    title: string;
    author: string;
    isbn: string;
    publication_year?: number;
    category_id?: number;
    price: number;
    owner_id: number;
    image_url?: string;
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {
    status?: Book['status'];
}