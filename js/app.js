    // Update footer with current year and last modified date
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Get last modified date from document
    const lastModified = new Date(document.lastModified);
    const formattedDate = `${lastModified.getDate().toString().padStart(2, '0')}/${
        (lastModified.getMonth() + 1).toString().padStart(2, '0')}/${
        lastModified.getFullYear()}`;
    document.getElementById('last-updated').textContent = formattedDate;

// Initialize the application
let storageManager, apiManager, gameEngine;

document.addEventListener('DOMContentLoaded', function() {
    storageManager = new StorageManager();
    apiManager = new APIManager();
    gameEngine = new GameEngine(storageManager, apiManager);
    
    // Load user settings
    loadUserSettings();
    
    // Update progress display
    gameEngine.updateProgressDisplay();
    
    // Hide loading screen
    document.getElementById('loading-screen').style.display = 'none';
    
    // Mark first game achievement
    if (!storageManager.getItem(storageManager.keys.ACHIEVEMENTS).firstGame) {
        storageManager.unlockAchievement('firstGame');
    }
    
    // Set up event listeners
    setupEventListeners();
});

// Navigation functions
function showHome() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('home-screen').classList.add('active');
    gameEngine.stopTimer();
}

function showProgress() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('progress-screen').classList.add('active');
    gameEngine.updateProgressDisplay();
    drawProgressChart();
}

function showSettings() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('settings-screen').classList.add('active');
    loadUserSettings();
}

function showGame() {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('game-screen').classList.add('active');
}

// Game launcher functions
function startFlashcardGame() {
    showGame();
    gameEngine.startFlashcardGame();
}

function startSpeedQuiz() {
    showGame();
    gameEngine.startSpeedQuiz();
}

function startTranslationExercise() {
    showGame();
    gameEngine.startTranslationExercise();
}

function startVisualAssociation() {
    showGame();
    gameEngine.startVisualAssociation();
}

// Game interaction functions
function flipCard(card) {
    card.classList.toggle('flipped');
    gameEngine.addScore(5);
}

function nextFlashcard() {
    gameEngine.startFlashcardGame();
}

function markAsKnown() {
    gameEngine.addScore(10);
    const progress = storageManager.updateProgress({
        wordsMastered: storageManager.getItem(storageManager.keys.USER_PROGRESS).wordsMastered + 1
    });
    gameEngine.showFeedback('Word marked as mastered! +10 points', 'success');
    setTimeout(() => nextFlashcard(), 1500);
}

function selectQuizOption(element, selected, correct) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => option.style.pointerEvents = 'none');
    
    if (selected === correct) {
        element.classList.add('correct');
        gameEngine.addScore(10);
        gameEngine.showFeedback('Correct! +10 points', 'success');
    } else {
        element.classList.add('incorrect');
        document.querySelectorAll('.quiz-option').forEach(option => {
            if (option.textContent.trim() === correct) {
                option.classList.add('correct');
            }
        });
        gameEngine.resetStreak();
        gameEngine.showFeedback('Incorrect. Try again!', 'error');
    }
    
    setTimeout(() => {
        if (gameEngine.timeLeft > 0) {
            gameEngine.nextQuizQuestion();
        }
    }, 2000);
}

function checkTranslation(correct) {
    const input = document.getElementById('translation-input');
    const userTranslation = input.value.trim().toLowerCase();
    const correctTranslation = correct.toLowerCase();
    
    if (userTranslation === correctTranslation) {
        gameEngine.addScore(15);
        gameEngine.showFeedback('Perfect translation! +15 points', 'success');
    } else {
        gameEngine.showFeedback(`Close! Correct answer: ${correct}`, 'error');
    }
    
    setTimeout(() => {
        gameEngine.startTranslationExercise();
    }, 2000);
}

function showHint(correct) {
    const hint = correct.substring(0, Math.ceil(correct.length / 2)) + '...';
    gameEngine.showFeedback(`Hint: ${hint}`, 'success');
}

function nextVisualWord() {
    gameEngine.startVisualAssociation();
}

function testVisualWord() {
    gameEngine.addScore(8);
    gameEngine.showFeedback('Great! +8 points for visual learning', 'success');
    setTimeout(() => nextVisualWord(), 1500);
}

// Settings functions
function loadUserSettings() {
    const settings = storageManager.getItem(storageManager.keys.GAME_SETTINGS);
    
    if (document.getElementById('target-language')) {
        document.getElementById('target-language').value = settings.targetLanguage;
    }
    if (document.getElementById('native-language')) {
        document.getElementById('native-language').value = settings.nativeLanguage;
    }
    if (document.getElementById('difficulty-level')) {
        document.getElementById('difficulty-level').value = settings.difficulty;
    }
    if (document.getElementById('timer-duration')) {
        document.getElementById('timer-duration').value = settings.timerDuration;
        document.getElementById('timer-value').textContent = settings.timerDuration;
    }
    if (document.getElementById('visual-hints')) {
        document.getElementById('visual-hints').checked = settings.visualHints;
    }
    if (document.getElementById('sound-effects')) {
        document.getElementById('sound-effects').checked = settings.soundEffects;
    }
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
        // Clear all storage
        window.linguaquestStorage = {};
        storageManager.initializeStorage();
        gameEngine.updateProgressDisplay();
        alert('Progress has been reset!');
    }
}

// Progress chart function
function drawProgressChart() {
    const canvas = document.getElementById('progress-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple progress visualization
    const progress = storageManager.getItem(storageManager.keys.USER_PROGRESS);
    const data = progress.performanceHistory || [];
    
    if (data.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Open Sans';
        ctx.textAlign = 'center';
        ctx.fillText('No data yet - start playing to see your progress!', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Draw simple bar chart
    const barWidth = canvas.width / data.length;
    const maxScore = Math.max(...data.map(d => d.score));
    
    data.forEach((entry, index) => {
        const barHeight = (entry.score / maxScore) * (canvas.height - 40);
        const x = index * barWidth;
        const y = canvas.height - barHeight - 20;
        
        ctx.fillStyle = '#2A5C8A';
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
        
        ctx.fillStyle = '#666';
        ctx.font = '12px Open Sans';
        ctx.textAlign = 'center';
        ctx.fillText(entry.score, x + barWidth / 2, y - 5);
    });
}

// Event listeners setup
function setupEventListeners() {
    // Navigation buttons
    document.getElementById('home-btn').addEventListener('click', showHome);
    document.getElementById('progress-btn').addEventListener('click', showProgress);
    document.getElementById('settings-btn').addEventListener('click', showSettings);
    document.getElementById('back-btn').addEventListener('click', showHome);
    document.getElementById('progress-back-btn').addEventListener('click', showHome);
    document.getElementById('settings-back-btn').addEventListener('click', showHome);
    
    // Game cards
    document.getElementById('flashcard-game').addEventListener('click', startFlashcardGame);
    document.getElementById('speed-quiz').addEventListener('click', startSpeedQuiz);
    document.getElementById('translation-exercise').addEventListener('click', startTranslationExercise);
    document.getElementById('visual-association').addEventListener('click', startVisualAssociation);
    
    // Settings changes
    document.getElementById('target-language').addEventListener('change', function(e) {
        storageManager.updateSettings({ targetLanguage: e.target.value });
    });
    document.getElementById('native-language').addEventListener('change', function(e) {
        storageManager.updateSettings({ nativeLanguage: e.target.value });
    });
    document.getElementById('difficulty-level').addEventListener('change', function(e) {
        storageManager.updateSettings({ difficulty: e.target.value });
    });
    document.getElementById('timer-duration').addEventListener('input', function(e) {
        storageManager.updateSettings({ timerDuration: parseInt(e.target.value) });
        document.getElementById('timer-value').textContent = e.target.value;
    });
    document.getElementById('visual-hints').addEventListener('change', function(e) {
        storageManager.updateSettings({ visualHints: e.target.checked });
    });
    document.getElementById('sound-effects').addEventListener('change', function(e) {
        storageManager.updateSettings({ soundEffects: e.target.checked });
    });
    document.getElementById('reset-progress-btn').addEventListener('click', resetProgress);
    
    // Dynamic game event listeners (delegated)
    document.addEventListener('click', function(e) {
        // Flashcard flip
        if (e.target.closest('.flashcard')) {
            flipCard(e.target.closest('.flashcard'));
        }
        
        // Quiz options
        if (e.target.closest('.quiz-option')) {
            const option = e.target.closest('.quiz-option');
            selectQuizOption(option, option.textContent.trim(), option.dataset.correct);
        }
    });
    
    // Next flashcard button
    document.addEventListener('click', function(e) {
        if (e.target.id === 'next-flashcard-btn') {
            nextFlashcard();
        }
        if (e.target.id === 'mark-known-btn') {
            markAsKnown();
        }
        if (e.target.id === 'check-translation-btn') {
            const correct = document.querySelector('.translation-container').dataset.correct;
            checkTranslation(correct);
        }
        if (e.target.id === 'show-hint-btn') {
            const correct = document.querySelector('.translation-container').dataset.correct;
            showHint(correct);
        }
        if (e.target.id === 'next-visual-btn') {
            nextVisualWord();
        }
        if (e.target.id === 'test-visual-btn') {
            testVisualWord();
        }
    });
}