const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Rental {
    id: string;
    book_id: string;
    renter_id: string;
    rental_date: string;
    expected_return_date: string;
    actual_return_date?: string;
    status: 'active' | 'returned';
    comment?: string;
    book_title?: string;
    book_author?: string;
    book_image_url?: string;
    category_id?: number;
    first_name?: string;
    last_name?: string;
}

class RentalsAPI {
    async getRentalsByUser(userId: string): Promise<Rental[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/user/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Rentals API error:", error);
            throw error;
        }
    }

    async rentBook(bookId: string, renterId: string, rentalDate: string, expectedReturnDate: string): Promise<Rental> {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/rent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    book_id: bookId,
                    renter_id: renterId,
                    rental_date: rentalDate,
                    expected_return_date: expectedReturnDate
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Rent book error:", error);
            throw error;
        }
    }

    async returnBook(rentalId: string, actualReturnDate: string, comment?: string): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/rentals/return`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rental_id: rentalId,
                    actual_return_date: actualReturnDate,
                    comment
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Return book error:", error);
            throw error;
        }
    }
}

export const rentalsAPI = new RentalsAPI();