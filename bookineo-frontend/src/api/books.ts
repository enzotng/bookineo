import type { Book, Category, BookFilters, BooksResponse, CreateBookRequest, UpdateBookRequest } from "../types/book";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

class BooksAPI {
    async getBooks(filters?: BookFilters): Promise<BooksResponse> {
        try {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        params.append(key, value.toString());
                    }
                });
            }

            const queryString = params.toString();
            const url = `${API_BASE_URL}/books${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Books API error:", error);
            throw error;
        }
    }

    async getBookById(id: string): Promise<Book> {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Book API error:", error);
            throw error;
        }
    }

    async getCategories(): Promise<Category[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Categories API error:", error);
            throw error;
        }
    }

    async getBooksAndCategories(filters?: BookFilters): Promise<{ booksResponse: BooksResponse; categories: Category[] }> {
        try {
            const [booksResponse, categories] = await Promise.all([
                this.getBooks(filters),
                this.getCategories()
            ]);

            return { booksResponse, categories };
        } catch (error) {
            console.error("Optimized fetch error:", error);
            throw error;
        }
    }

    async createBook(book: CreateBookRequest): Promise<Book> {
        try {
            const response = await fetch(`${API_BASE_URL}/books`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(book),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Create book error:", error);
            throw error;
        }
    }

    async updateBook(id: string, updates: UpdateBookRequest): Promise<Book> {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Update book error:", error);
            throw error;
        }
    }

    async deleteBook(id: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Delete book error:", error);
            throw error;
        }
    }
}

export const booksAPI = new BooksAPI();