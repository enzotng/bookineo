import type { Book } from "./book";

export interface RentalCartItem {
    book: Book;
    rental_date: string;
    expected_return_date: string;
    renter_id: string;
    renter_name: string;
    duration_days: number;
    total_price: number;
}

export interface RentalCart {
    items: RentalCartItem[];
    total_amount: number;
    total_items: number;
}

export interface CreateRentalRequest {
    book_id: string;
    renter_id: string;
    rental_date: string;
    expected_return_date: string;
}

export interface RentalSummary {
    book_title: string;
    renter_name: string;
    rental_date: string;
    expected_return_date: string;
    price: number;
    duration_days: number;
}