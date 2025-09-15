import React from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui";
import { Layout } from "../components/layout";
import { Search, Plus, Filter, Download, Eye } from "lucide-react";

interface Book {
    id: string;
    title: string;
    author: string;
    year: number;
    category: string;
    status: "available" | "rented";
    price: number;
    owner: string;
    rentedDate?: string;
    returnDate?: string;
    renterName?: string;
}

const mockBooks: Book[] = [
    {
        id: "1",
        title: "Le Petit Prince",
        author: "Antoine de Saint-Exupéry",
        year: 1943,
        category: "Fiction",
        status: "available",
        price: 15.99,
        owner: "Marie Dubois",
    },
    {
        id: "2",
        title: "1984",
        author: "George Orwell",
        year: 1949,
        category: "Science Fiction",
        status: "rented",
        price: 12.5,
        owner: "Jean Martin",
        rentedDate: "2024-01-10",
        returnDate: "2024-02-10",
        renterName: "Sophie Laurent",
    },
    {
        id: "3",
        title: "L'Étranger",
        author: "Albert Camus",
        year: 1942,
        category: "Philosophie",
        status: "available",
        price: 18.0,
        owner: "Pierre Durand",
    },
];

const Home: React.FC = () => {
    const [books, setBooks] = React.useState<Book[]>(mockBooks);
    const [searchTitle, setSearchTitle] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState<string>("all");
    const [filterCategory, setFilterCategory] = React.useState<string>("all");

    const filteredBooks = React.useMemo(() => {
        return books.filter((book) => {
            const matchesTitle = book.title.toLowerCase().includes(searchTitle.toLowerCase());
            const matchesStatus = filterStatus === "all" || book.status === filterStatus;
            const matchesCategory = filterCategory === "all" || book.category === filterCategory;

            return matchesTitle && matchesStatus && matchesCategory;
        });
    }, [books, searchTitle, filterStatus, filterCategory]);

    const categories = React.useMemo(() => {
        const uniqueCategories = Array.from(new Set(books.map((book) => book.category)));
        return uniqueCategories;
    }, [books]);

    const getStatusBadge = (status: string) => {
        return status === "available" ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Disponible</Badge> : <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Loué</Badge>;
    };

    const exportCSV = () => {
        const headers = ["Titre", "Auteur", "Année", "Catégorie", "Statut", "Prix", "Propriétaire"];
        const csvContent = [
            headers.join(","),
            ...filteredBooks.map((book) => [book.title, book.author, book.year, book.category, book.status === "available" ? "Disponible" : "Loué", book.price, book.owner].join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "bookineo-livres.csv");
        link.click();
    };

    return (
        <Layout>
            <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Catalogue de livres</h1>
                    <p className="text-gray-600">Découvrez et louez des livres entre particuliers</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={exportCSV} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exporter CSV
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un livre
                    </Button>
                </div>
            </div>

            {/* Filtres et Recherche */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Rechercher et filtrer
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Recherche par titre */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input type="text" placeholder="Rechercher par titre..." value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} className="pl-10" />
                            </div>
                        </div>

                        {/* Filtre par statut */}
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="available">Disponible</SelectItem>
                                <SelectItem value="rented">Loué</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Filtre par catégorie */}
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes catégories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Résultats */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>
                            Livres ({filteredBooks.length} résultat{filteredBooks.length > 1 ? "s" : ""})
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium text-gray-900">Titre</th>
                                    <th className="text-left p-3 font-medium text-gray-900">Auteur</th>
                                    <th className="text-left p-3 font-medium text-gray-900">Année</th>
                                    <th className="text-left p-3 font-medium text-gray-900">Catégorie</th>
                                    <th className="text-left p-3 font-medium text-gray-900">Statut</th>
                                    <th className="text-left p-3 font-medium text-gray-900">Prix</th>
                                    <th className="text-left p-3 font-medium text-gray-900">Propriétaire</th>
                                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBooks.map((book) => (
                                    <tr key={book.id} className={`border-b hover:bg-gray-50 ${book.status === "available" ? "bg-green-50" : "bg-red-50"}`}>
                                        <td className="p-3 font-medium text-gray-900">{book.title}</td>
                                        <td className="p-3 text-gray-700">{book.author}</td>
                                        <td className="p-3 text-gray-700">{book.year}</td>
                                        <td className="p-3">
                                            <Badge variant="secondary">{book.category}</Badge>
                                        </td>
                                        <td className="p-3">{getStatusBadge(book.status)}</td>
                                        <td className="p-3 font-medium text-gray-900">{book.price}€</td>
                                        <td className="p-3 text-gray-700">{book.owner}</td>
                                        <td className="p-3">
                                            <Button size="sm" variant="outline">
                                                <Eye className="w-4 h-4 mr-1" />
                                                Détail
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredBooks.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Aucun livre trouvé avec ces critères de recherche.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            </div>
        </Layout>
    );
};

export default Home;
