export interface Rental {
    id: string;
    book_id: string;
    renter_id: string;
    rental_date: Date;
    expected_return_date?: Date | null;
    actual_return_date?: Date | null;
    duration_days?: number | null;
    status: string;
    comment?: string | null;
    created_at: Date;
    updated_at: Date;
}
