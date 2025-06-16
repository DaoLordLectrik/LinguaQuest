// Game Engine
class GameEngine {
    constructor(storageManager, apiManager) {
        this.storage = storageManager;
        this.api = apiManager;
        this.currentGame = null;
        this.score = 0;
        this.streak = 0;
        this.timer = null;
        this.timeLeft = 30;
        
        this.vocabularyWords = [
            'hello', 'house', 'car', 'water', 'food',
            'book', 'tree', 'sun', 'moon', 'cat',
            'dog', 'bird', 'flower', 'mountain', 'ocean'
        ];
    }

    async startFlashcardGame() {
        this.currentGame = 'flashcard';
        this.score = 0;
        this.streak = 0;
        this.updateUI();
        
        const word = this.getRandomWord();
        const settings = this.storage.getItem(this.storage.keys.GAME_SETTINGS);
        const translation = await this.api.translateText(word, 'en', settings.targetLanguage);
        
        const gameContent = document.getElementById('game-content');
        gameContent.innerHTML = `
            <div class="flashcard-container">
                <div class="flashcard" onclick="flipCard(this)">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <div>${word}</div>
                        </div>
                        <div class="flashcard-back">
                            <div>${translation}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 2rem;">
                <button class="btn-primary" id="next-flashcard-btn">Next Word</button>
                <button class="btn-primary" id="mark-known-btn" style="margin-left: 1rem; background: #4CAF50;">I Know This</button>
            </div>
        `;
        
        this.storage.addVocabularyWord(word, translation, settings.targetLanguage);
    }

    async startSpeedQuiz() {
        this.currentGame = 'speed_quiz';
        this.score = 0;
        this.streak = 0;
        this.timeLeft = CONFIG.GAME_TIMER_DURATION;
        this.updateUI();
        this.startTimer();
        await this.nextQuizQuestion();
    }

    async nextQuizQuestion() {
        const word = this.getRandomWord();
        const settings = this.storage.getItem(this.storage.keys.GAME_SETTINGS);
        const correctTranslation = await this.api.translateText(word, 'en', settings.targetLanguage);
        
        const wrongOptions = [];
        for (let i = 0; i < 3; i++) {
            const wrongWord = this.getRandomWord();
            if (wrongWord !== word) {
                const wrongTranslation = await this.api.translateText(wrongWord, 'en', settings.targetLanguage);
                wrongOptions.push(wrongTranslation);
            }
        }
        
        const allOptions = [correctTranslation, ...wrongOptions].sort(() => Math.random() - 0.5);
        
        const gameContent = document.getElementById('game-content');
        gameContent.innerHTML = `
            <div class="quiz-container">
                <div class="quiz-question">What is "${word}" in ${this.getLanguageName(settings.targetLanguage)}?</div>
                <div class="quiz-options">
                    ${allOptions.map(option => `
                        <div class="quiz-option" data-option="${option}" data-correct="${correctTranslation}">
                            ${option}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async startTranslationExercise() {
        this.currentGame = 'translation';
        this.score = 0;
        this.streak = 0;
        this.updateUI();
        
        const phrases = [
            'How are you?',
            'Where is the bathroom?',
            'I would like some water.',
            'Thank you very much.',
            'What time is it?'
        ];
        
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        const settings = this.storage.getItem(this.storage.keys.GAME_SETTINGS);
        const translation = await this.api.translateText(phrase, 'en', settings.targetLanguage);
        
        const gameContent = document.getElementById('game-content');
        gameContent.innerHTML = `
            <div class="translation-container" style="text-align: center;">
                <h3>Translate this phrase:</h3>
                <div style="font-size: 1.5rem; margin: 2rem 0; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                    "${phrase}"
                </div>
                <input type="text" id="translation-input" placeholder="Enter your translation..." 
                       style="width: 100%; padding: 1rem; font-size: 1.2rem; border: 2px solid #ddd; border-radius: 10px; margin-bottom: 1rem;">
                <br>
                <button class="btn-primary" id="check-translation-btn">Check Translation</button>
                <button class="btn-primary" id="show-hint-btn" style="margin-left: 1rem; background: #FFD700; color: #333;">Hint</button>
            </div>
        `;
    }

    async startVisualAssociation() {
        this.currentGame = 'visual';
        this.score = 0;
        this.streak = 0;
        this.updateUI();
        
        const word = this.getRandomWord();
        const settings = this.storage.getItem(this.storage.keys.GAME_SETTINGS);
        const translation = await this.api.translateText(word, 'en', settings.targetLanguage);
        const imageUrl = await this.api.getWordImage(word);
        
        const gameContent = document.getElementById('game-content');
        gameContent.innerHTML = `
            <div class="visual-association-container">
                <img src="${imageUrl}" alt="${word}" class="word-image" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Available'">
                <div class="word-display">${word}</div>
                <div class="word-translation">${translation}</div>
                <div style="margin-top: 2rem;">
                    <button class="btn-primary" id="next-visual-btn">Next Word</button>
                    <button class="btn-primary" id="test-visual-btn" style="margin-left: 1rem; background: #4CAF50;">Test Me</button>
                </div>
            </div>
        `;
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    addScore(points) {
        this.score += points;
        this.streak++;
        this.updateUI();
        
        // Check for achievements
        this.checkAchievements();
    }

    resetStreak() {
        this.streak = 0;
        this.updateUI();
    }

    checkAchievements() {
        const achievements = this.storage.getItem(this.storage.keys.ACHIEVEMENTS);
        let newAchievements = false;
        
        if (this.score >= 100 && !achievements.hundredPoints) {
            this.storage.unlockAchievement('hundredPoints');
            this.showAchievement('Century Club', 'Scored 100 points!');
            newAchievements = true;
        }
        
        if (this.streak >= 5 && !achievements.perfectQuiz) {
            this.storage.unlockAchievement('perfectQuiz');
            this.showAchievement('Perfect Streak', '5 correct answers in a row!');
            newAchievements = true;
        }
        
        if (newAchievements) {
            this.updateProgressDisplay();
        }
    }

    showAchievement(title, description) {
        const successOverlay = document.getElementById('success-animation');
        const successText = document.getElementById('success-text');
        successText.textContent = `${title}: ${description}`;
        successOverlay.style.display = 'flex';
        
        setTimeout(() => {
            successOverlay.style.display = 'none';
        }, 3000);
    }

    endGame() {
        this.stopTimer();
        
        // Update progress
        const progress = this.storage.updateProgress({
            totalScore: this.storage.getItem(this.storage.keys.USER_PROGRESS).totalScore + this.score,
            gamesPlayed: this.storage.getItem(this.storage.keys.USER_PROGRESS).gamesPlayed + 1,
            lastPlayDate: new Date().toISOString()
        });
        
        // Show final score
        this.showFeedback(`Game Over! Final Score: ${this.score}`, 'success');
        
        setTimeout(() => {
            showHome();
        }, 2000);
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `game-feedback feedback-${type === 'success' ? 'correct' : 'incorrect'}`;
        feedback.style.display = 'block';
        
        setTimeout(() => {
            feedback.style.display = 'none';
        }, 2000);
    }

    updateUI() {
        document.getElementById('current-score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
    }

    updateProgressDisplay() {
        const progress = this.storage.getItem(this.storage.keys.USER_PROGRESS);
        const achievements = this.storage.getItem(this.storage.keys.ACHIEVEMENTS);
        
        if (document.getElementById('streak-display')) {
            document.getElementById('streak-display').textContent = progress.streak;
            document.getElementById('words-mastered').textContent = progress.wordsMastered;
            document.getElementById('total-score').textContent = progress.totalScore;
        }
        
        // Update achievements display
        const achievementsList = document.getElementById('achievements-list');
        if (achievementsList) {
            const achievementData = [
                { key: 'firstGame', title: 'First Steps', description: 'Play your first game', icon: '🎮' },
                { key: 'tenWords', title: 'Vocabulary Builder', description: 'Learn 10 words', icon: '📚' },
                { key: 'hundredPoints', title: 'Century Club', description: 'Score 100 points', icon: '💯' },
                { key: 'weekStreak', title: 'Dedicated Learner', description: '7-day streak', icon: '🔥' },
                { key: 'perfectQuiz', title: 'Perfect Streak', description: '5 correct in a row', icon: '⭐' }
            ];
            
            achievementsList.innerHTML = achievementData.map(achievement => `
                <div class="achievement ${achievements[achievement.key] ? 'unlocked' : ''}">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${achievement.icon}</div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">${achievement.title}</div>
                    <div style="font-size: 0.8rem;">${achievement.description}</div>
                </div>
            `).join('');
        }
    }

    getRandomWord() {
        return this.vocabularyWords[Math.floor(Math.random() * this.vocabularyWords.length)];
    }

    getLanguageName(code) {
        const names = {
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese'
        };
        return names[code] || code;
    }
}