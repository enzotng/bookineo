import chatFunctions from "./chatFunctions.ts";

class LMStudioService {
    baseURL: any;

    constructor() {
        this.baseURL = process.env.LM_STUDIO_URL as any;
    }

    async sendMessage(messages: any[]): Promise<any> {
        try {
            const lastMessage: any = messages[messages.length - 1];
            const userMessage: any = lastMessage?.content?.toLowerCase() || "";

            const isBookQuery: any = this.isBookRelatedQuery(userMessage);

            if (!isBookQuery) {
                return "Je suis l'assistant Bookineo et je ne peux répondre qu'aux questions concernant les livres, la location, les catégories et les statistiques de notre plateforme. Posez-moi une question sur nos livres disponibles !";
            }

            const data: any = await chatFunctions.getAllData();
            const contextData: any = chatFunctions.formatDataForLLM(data);

            console.log("📚 Données injectées:", {
                totalBooks: data.books.length,
                categories: data.categories.length,
                stats: data.stats,
            });

            const enhancedMessages: any = [
                {
                    role: "system",
                    content: `Tu es l'assistant Bookineo, expert de notre plateforme de location de livres entre particuliers. Tu ne réponds QU'aux questions sur les livres, locations, recherches, prix, catégories et statistiques.

Si on te pose une question hors sujet, répond poliment que tu ne peux aider que pour les questions liées aux livres.

FORMAT DE RÉPONSE OBLIGATOIRE:
- Utilise **gras** pour les titres de livres, noms d'auteurs et prix importants
- Utilise des listes à puces pour énumérer plusieurs livres
- Structure tes réponses de façon claire et lisible

DONNÉES ACTUELLES DE LA BASE:
${contextData}

Utilise ces données pour répondre précisément aux questions. Sois concis et utile.`,
                },
                ...messages.slice(-3),
            ];

            const response: any = await fetch(`${this.baseURL}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "qwen2-1_5b-instruct",
                    messages: enhancedMessages,
                    temperature: 0.3,
                    max_tokens: 500,
                    stream: false,
                }),
            });

            if (!response.ok) {
                throw new Error(`LM Studio API error: ${response.status}`);
            }

            const responseData: any = await response.json();
            return responseData.choices[0]?.message?.content || "Je n'ai pas pu traiter votre demande.";
        } catch (error: any) {
            console.error("LM Studio API Error:", error);
            throw new Error("Impossible de se connecter au chatbot. Vérifiez que LM Studio est démarré.");
        }
    }

    isBookRelatedQuery(message: any): any {
        const bookKeywords: any = [
            "livre",
            "livres",
            "book",
            "books",
            "auteur",
            "author",
            "titre",
            "title",
            "louer",
            "location",
            "rent",
            "rental",
            "prix",
            "price",
            "coût",
            "cost",
            "catégorie",
            "category",
            "genre",
            "disponible",
            "available",
            "recherche",
            "search",
            "trouver",
            "find",
            "statistique",
            "stats",
            "combien",
            "propriétaire",
            "owner",
            "récent",
            "recent",
            "nouveau",
            "new",
        ];

        return bookKeywords.some((keyword: any) => message.includes(keyword));
    }

    async testConnection(): Promise<any> {
        try {
            const response: any = await fetch(`${this.baseURL}/models`, {
                method: "GET",
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

export default new LMStudioService();
