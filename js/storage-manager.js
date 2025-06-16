// Configuration
const CONFIG = {
    UNSPLASH_ACCESS_KEY: '1N2JAYIEtLdtnKM8LS6zR4BgUwtxA2xaPw42g9id7T0',
    DICTIONARY_API_URL: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
    TRANSLATE_API_URL: 'https://api.mymemory.translated.net/get',
    UNSPLASH_API_URL: 'https://api.unsplash.com/search/photos',
    GAME_TIMER_DURATION: 30,
    DIFFICULTY_LEVELS: {
        easy: { timeBonus: 1.5, hintPenalty: 0.5 },
        medium: { timeBonus: 1.0, hintPenalty: 0.7 },
        hard: { timeBonus: 0.8, hintPenalty: 1.0 },
        adaptive: { timeBonus: 1.2, hintPenalty: 0.8 }
    }
};

// Storage Manager
class StorageManager {
    constructor() {
        this.keys = {
            USER_PROGRESS: 'linguaquest_progress',
            GAME_SETTINGS: 'linguaquest_settings',
            VOCABULARY_DATA: 'linguaquest_vocabulary',
            ACHIEVEMENTS: 'linguaquest_achievements',
            DAILY_STREAK: 'linguaquest_streak'
        };
        this.initializeStorage();
    }

    initializeStorage() {
        const defaultProgress = {
            totalScore: 0,
            wordsMastered: 0,
            gamesPlayed: 0,
            streak: 0,
            lastPlayDate: null,
            performanceHistory: []
        };

        const defaultSettings = {
            nativeLanguage: 'en',
            targetLanguage: 'es',
            difficulty: 'medium',
            timerDuration: 30,
            visualHints: true,
            soundEffects: true
        };

        const defaultAchievements = {
            firstGame: false,
            tenWords: false,
            hundredPoints: false,
            weekStreak: false,
            perfectQuiz: false
        };

        if (!this.getItem(this.keys.USER_PROGRESS)) {
            this.setItem(this.keys.USER_PROGRESS, defaultProgress);
        }
        if (!this.getItem(this.keys.GAME_SETTINGS)) {
            this.setItem(this.keys.GAME_SETTINGS, defaultSettings);
        }
        if (!this.getItem(this.keys.ACHIEVEMENTS)) {
            this.setItem(this.keys.ACHIEVEMENTS, defaultAchievements);
        }
    }

    setItem(key, value) {
        try {
            // Using in-memory storage instead of localStorage
            if (!window.linguaquestStorage) {
                window.linguaquestStorage = {};
            }
            window.linguaquestStorage[key] = JSON.stringify(value);
        } catch (error) {
            console.error('Storage error:', error);
        }
    }

    getItem(key) {
        try {
            if (!window.linguaquestStorage) {
                window.linguaquestStorage = {};
            }
            const item = window.linguaquestStorage[key];
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage error:', error);
            return null;
        }
    }

    updateProgress(updates) {
        const progress = this.getItem(this.keys.USER_PROGRESS);
        const updatedProgress = { ...progress, ...updates };
        this.setItem(this.keys.USER_PROGRESS, updatedProgress);
        return updatedProgress;
    }

    updateSettings(updates) {
        const settings = this.getItem(this.keys.GAME_SETTINGS);
        const updatedSettings = { ...settings, ...updates };
        this.setItem(this.keys.GAME_SETTINGS, updatedSettings);
        return updatedSettings;
    }

    addVocabularyWord(word, translation, language) {
        const vocab = this.getItem(this.keys.VOCABULARY_DATA) || {};
        if (!vocab[language]) vocab[language] = [];
        
        const existingWord = vocab[language].find(w => w.word === word);
        if (!existingWord) {
            vocab[language].push({
                word,
                translation,
                mastered: false,
                attempts: 0,
                correctAttempts: 0,
                dateAdded: new Date().toISOString()
            });
            this.setItem(this.keys.VOCABULARY_DATA, vocab);
        }
    }

    unlockAchievement(achievementKey) {
        const achievements = this.getItem(this.keys.ACHIEVEMENTS);
        if (!achievements[achievementKey]) {
            achievements[achievementKey] = true;
            this.setItem(this.keys.ACHIEVEMENTS, achievements);
            return true;
        }
        return false;
    }
}