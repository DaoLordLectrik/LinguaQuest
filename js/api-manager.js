// API Manager
class APIManager {
    constructor() {
        this.cache = new Map();
    }

    async translateText(text, fromLang, toLang) {
        const cacheKey = `${text}_${fromLang}_${toLang}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(
                `${CONFIG.TRANSLATE_API_URL}?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`
            );
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                const translation = data.responseData.translatedText;
                this.cache.set(cacheKey, translation);
                return translation;
            }
            
            // Fallback translations for demo
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
            const response = await fetch(`${CONFIG.DICTIONARY_API_URL}${word}`);
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

        // Using demo images since we can't access Unsplash without proper API key
        const demoImages = {
            'hello': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=200&fit=crop',
            'house': 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300&h=200&fit=crop',
            'car': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=200&fit=crop',
            'water': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop',
            'food': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
            'book': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
            'tree': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop',
            'sun': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
            'moon': 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=200&fit=crop',
            'cat': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=200&fit=crop'
        };

        const imageUrl = demoImages[word.toLowerCase()] || 'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?w=300&h=200&fit=crop';
        this.cache.set(cacheKey, imageUrl);
        return imageUrl;
    }
}