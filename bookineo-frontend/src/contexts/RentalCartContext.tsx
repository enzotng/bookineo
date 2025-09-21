import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { RentalCartItem, RentalCart } from "../types/rental-cart";
import type { Book } from "../types/book";
import { toast } from "react-toastify";
import { rentalsAPI } from "../api/rentals";
import { useAuth } from "../hooks/useAuth";

const CART_STORAGE_KEY = "rental-cart";

interface RentalCartContextType {
    cart: RentalCart;
    cartItems: RentalCartItem[];
    isProcessing: boolean;
    addToCart: (book: Book) => boolean;
    removeFromCart: (bookId: string) => void;
    updateCartItem: (bookId: string, updates: Partial<Omit<RentalCartItem, "book">>) => void;
    clearCart: () => void;
    processRentals: () => Promise<boolean>;
    isBookInCart: (bookId: string) => boolean;
    getCartItemByBookId: (bookId: string) => RentalCartItem | undefined;
}

const RentalCartContext = createContext<RentalCartContextType | undefined>(undefined);

export const RentalCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<RentalCartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Error loading cart from storage:", error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = useCallback(
        (book: Book) => {
            const exists = cartItems.find((item) => item.book.id === book.id);

            if (exists) {
                toast.warning("Ce livre est déjà dans votre panier");
                return false;
            }

            const rental_date = "";
            const expected_return_date = "";
            const duration_days = 0;
            const total_price = 0;

            const newItem: RentalCartItem = {
                book,
                rental_date,
                expected_return_date,
                renter_id: user?.id.toString() || "",
                renter_name: user ? `${user.first_name} ${user.last_name}`.trim() : "",
                duration_days,
                total_price,
            };

            setCartItems((prev) => [...prev, newItem]);
            toast.success(`"${book.title}" ajouté au panier`);
            return true;
        },
        [cartItems, user]
    );

    const removeFromCart = useCallback((bookId: string) => {
        setCartItems((prev) => {
            const filtered = prev.filter((item) => item.book.id !== bookId);
            const removedItem = prev.find((item) => item.book.id === bookId);
            if (removedItem) {
                toast.info(`"${removedItem.book.title}" retiré du panier`);
            }
            return filtered;
        });
    }, []);

    const updateCartItem = useCallback((bookId: string, updates: Partial<Omit<RentalCartItem, "book">>) => {
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.book.id === bookId) {
                    const updatedItem = { ...item, ...updates };
                    if (updates.rental_date || updates.expected_return_date) {
                        const startDate = new Date(updatedItem.rental_date);
                        const endDate = new Date(updatedItem.expected_return_date);
                        updatedItem.duration_days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                        updatedItem.total_price = item.book.price * updatedItem.duration_days;
                    }
                    return updatedItem;
                }
                return item;
            })
        );
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        localStorage.removeItem(CART_STORAGE_KEY);
        toast.success("Panier vidé");
    }, []);

    const cart = useMemo((): RentalCart => ({
        items: cartItems,
        total_amount: cartItems.reduce((sum, item) => sum + item.total_price, 0),
        total_items: cartItems.length,
    }), [cartItems]);

    const processRentals = useCallback(async (): Promise<boolean> => {
        if (cartItems.length === 0) {
            toast.warning("Le panier est vide");
            return false;
        }

        setIsProcessing(true);

        try {
            const results = await Promise.allSettled(cartItems.map((item) => rentalsAPI.rentBook(item.book.id, item.renter_id, item.rental_date, item.expected_return_date)));

            const successes = results.filter((result) => result.status === "fulfilled").length;
            const failures = results.filter((result) => result.status === "rejected").length;

            if (successes === cartItems.length) {
                toast.success(`🎉 ${successes} location${successes > 1 ? "s" : ""} confirmée${successes > 1 ? "s" : ""} !`);
                clearCart();
                return true;
            } else if (successes > 0) {
                toast.warning(`${successes} location${successes > 1 ? "s" : ""} confirmée${successes > 1 ? "s" : ""}, ${failures} échec${failures > 1 ? "s" : ""}`);
                const failedItems = cartItems.filter((_, index) => results[index].status === "rejected");
                setCartItems(failedItems);
                return false;
            } else {
                toast.error("Aucune location n'a pu être confirmée");
                return false;
            }
        } catch (error) {
            console.error("Error processing rentals:", error);
            toast.error("Erreur lors du traitement des locations");
            return false;
        } finally {
            setIsProcessing(false);
        }
    }, [cartItems, clearCart]);

    const isBookInCart = useCallback((bookId: string) => cartItems.some((item) => item.book.id === bookId), [cartItems]);

    const getCartItemByBookId = useCallback((bookId: string) => cartItems.find((item) => item.book.id === bookId), [cartItems]);

    const value = {
        cart,
        cartItems,
        isProcessing,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        processRentals,
        isBookInCart,
        getCartItemByBookId,
    };

    return <RentalCartContext.Provider value={value}>{children}</RentalCartContext.Provider>;
};

export const useRentalCart = () => {
    const context = useContext(RentalCartContext);
    if (context === undefined) {
        throw new Error("useRentalCart must be used within a RentalCartProvider");
    }
    return context;
};
