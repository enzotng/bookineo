class LMStudioService {
    constructor() {
        this.baseURL = process.env.LM_STUDIO_URL;
    }

    async sendMessage(messages) {
        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",
                    messages,
                    temperature: 0.7,
                    max_tokens: 1000,
                    stream: false,
                }),
            });

            if (!response.ok) {
                throw new Error(`LM Studio API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";
        } catch (error) {
            console.error("LM Studio API Error:", error);
            throw new Error("Impossible de se connecter au chatbot. Vérifiez que LM Studio est démarré.");
        }
    }

    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/models`, {
                method: "GET",
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

export default new LMStudioService();
