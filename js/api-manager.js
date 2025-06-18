// API Manager
class APIManager {
    constructor() {
        this.cache = new Map();
        this.UNSPLASH_ACCESS_KEY = '1N2JAYIEtLdtnKM8LS6zR4BgUwtxA2xaPw42g9id7T0';
        this.UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';
        this.DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
        this.TRANSLATE_API_URL = 'https://api.mymemory.translated.net/get';
    }

    async translateText(text, fromLang, toLang) {
        const cacheKey = `${text}_${fromLang}_${toLang}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(
                `${this.TRANSLATE_API_URL}?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
            );
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                const translation = data.responseData.translatedText;
                this.cache.set(cacheKey, translation);
                return translation;
            }
            
            return this.getFallbackTranslation(text, toLang);
        } catch (error) {
            console.error('Translation error:', error);
            return this.getFallbackTranslation(text, toLang);
        }
    }

    getFallbackTranslation(text, toLang) {
        const translations = {
            es: {
                'hello': 'hola',
                'house': 'casa',
                'car': 'coche',
                'water': 'agua',
                'food': 'comida',
                'book': 'libro',
                'tree': 'árbol',
                'sun': 'sol',
                'moon': 'luna',
                'cat': 'gato'
            },
            fr: {
                'hello': 'bonjour',
                'house': 'maison',
                'car': 'voiture',
                'water': 'eau',
                'food': 'nourriture',
                'book': 'livre',
                'tree': 'arbre',
                'sun': 'soleil',
                'moon': 'lune',
                'cat': 'chat'
            },
            de: {
                'hello': 'hallo',
                'house': 'haus',
                'car': 'auto',
                'water': 'wasser',
                'food': 'essen',
                'book': 'buch',
                'tree': 'baum',
                'sun': 'sonne',
                'moon': 'mond',
                'cat': 'katze'
            }
        };
        
        return translations[toLang]?.[text.toLowerCase()] || text;
    }

    async getWordDefinition(word) {
        const cacheKey = `def_${word}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${this.DICTIONARY_API_URL}${word}`);
            const data = await response.json();
            
            if (data && data[0] && data[0].meanings) {
                const definition = data[0].meanings[0].definitions[0].definition;
                this.cache.set(cacheKey, definition);
                return definition;
            }
        } catch (error) {
            console.error('Dictionary error:', error);
        }
        
        return 'Definition not available';
    }

    async getWordImage(word) {
        const cacheKey = `img_${word}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(
                `${this.UNSPLASH_API_URL}?query=${encodeURIComponent(word)}&page=1&per_page=1&client_id=${this.UNSPLASH_ACCESS_KEY}`
            );
            
            if (!response.ok) {
                throw new Error(`Unsplash API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                // Use small size to optimize loading
                const imageUrl = `${data.results[0].urls.raw}&w=300&h=200&fit=crop`;
                this.cache.set(cacheKey, imageUrl);
                return imageUrl;
            }
        } catch (error) {
            console.error('Unsplash API error:', error);
        }
        
        // Fallback to placeholder if API fails
        return 'https://via.placeholder.com/300x200?text=Image+Not+Available';
    }
}
