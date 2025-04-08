/**
 * French Grammar Quiz - Quiz Manager Module
 */

class QuizManager {
    constructor() {
        this.categories = window.quizCategories || [];
        this.quizData = window.quizData || {};
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.quizStartTime = null;
        console.log('QuizManager initialized with:', {
            categories: this.categories.length,
            quizData: Object.keys(this.quizData).length
        });
    }

    /**
     * Get all available quiz categories
     */
    getCategories() {
        return this.categories;
    }

    /**
     * Start a quiz for a given category
     */
    startQuiz(categoryId) {
        console.log('Starting quiz for category:', categoryId);

        // Look for the category in quizData
        if (this.quizData[categoryId]) {
            this.currentQuiz = this.quizData[categoryId];
            console.log('Found quiz in quizData:', this.currentQuiz.title);
        }
        // Try to find it by mapping from the category ID
        else {
            // Map from category ID to quiz data object key
            const categoryMap = {
                'telling-time': 'tellingTime',
                'writing-practice': 'writingPractice',
                'matching-articles': 'matchingArticles',
                'subject-verb': 'subjectVerbAgreement',
                'free-writing': 'freeWriting'
            };

            const quizDataKey = categoryMap[categoryId];
            if (quizDataKey && this.quizData[quizDataKey]) {
                this.currentQuiz = this.quizData[quizDataKey];
                console.log('Found quiz via mapping:', this.currentQuiz.title);
            } else {
                console.error(`Quiz category '${categoryId}' not found in quiz data`);
                throw new Error(`Quiz category '${categoryId}' not found`);
            }
        }

        // Initialize quiz state
        this.currentQuestionIndex = 0;
        this.userAnswers = Array(this.getQuestionCount()).fill(null);
        this.quizStartTime = new Date();

        return this.currentQuiz;
    }

    /**
     * Get the total number of questions in the current quiz
     */
    getQuestionCount() {
        if (!this.currentQuiz) return 0;
        return this.currentQuiz.questions?.length || 0;
    }

    /**
     * Get the current question
     */
    getCurrentQuestion() {
        if (!this.currentQuiz || !this.currentQuiz.questions) {
            console.warn("No active quiz or no questions available");
            return null;
        }

        if (this.currentQuestionIndex >= this.currentQuiz.questions.length) {
            console.warn("Question index out of bounds");
            return null;
        }

        return this.currentQuiz.questions[this.currentQuestionIndex];
    }

    /**
     * Move to the next question
     */
    nextQuestion() {
        if (!this.currentQuiz || !this.currentQuiz.questions) return null;

        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            return this.getCurrentQuestion();
        }

        return null; // No more questions
    }

    /**
     * Move to the previous question
     */
    previousQuestion() {
        if (!this.currentQuiz) return null;

        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return this.getCurrentQuestion();
        }

        return null; // Already at the first question
    }

    /**
     * Submit an answer for the current question
     */
    submitAnswer(answer) {
        if (!this.currentQuiz) return;

        this.userAnswers[this.currentQuestionIndex] = answer;
    }

    /**
     * Get the current progress in the quiz
     */
    getProgress() {
        return {
            current: this.currentQuestionIndex + 1,
            total: this.getQuestionCount()
        };
    }

    /**
     * Reset the current quiz
     */
    resetQuiz() {
        if (!this.currentQuiz) return;

        this.currentQuestionIndex = 0;
        this.userAnswers = Array(this.getQuestionCount()).fill(null);
        this.quizStartTime = new Date();
    }

    /**
     * Calculate quiz results
     */
    calculateResults() {
        // Placeholder implementation - would need more logic for real implementation
        const totalQuestions = this.getQuestionCount();
        const correctAnswers = Math.floor(Math.random() * (totalQuestions + 1)); // Random for demo
        const score = Math.round((correctAnswers / totalQuestions) * 100);

        const detailedResults = [];

        // Generate detailed results for each question
        for (let i = 0; i < totalQuestions; i++) {
            const question = this.currentQuiz.questions[i];
            const userAnswer = this.userAnswers[i];
            const isCorrect = Math.random() < 0.7; // Random for demo

            let correctAnswer;

            // Determine the correct answer based on question type
            switch (question.type) {
                case 'multiple-choice':
                    correctAnswer = Array.isArray(question.correctAnswers)
                        ? question.options
                            .filter(option => question.correctAnswers.includes(option.id))
                            .map(option => option.text)
                            .join(', ')
                        : 'Unknown';
                    break;

                case 'fill-in-blank':
                    correctAnswer = {};
                    if (question.blanks && Array.isArray(question.blanks)) {
                        question.blanks.forEach(blank => {
                            correctAnswer[blank.id] = blank.answer;
                        });
                    }
                    break;

                case 'text-input':
                    correctAnswer = question.correctAnswer || 'Unknown';
                    break;

                case 'matching':
                    correctAnswer = question.pairs
                        ? Object.fromEntries(question.pairs.map(pair => [pair.item, pair.match]))
                        : {};
                    break;

                case 'free-writing':
                    correctAnswer = question.sampleAnswer || 'No sample answer provided';
                    break;

                default:
                    correctAnswer = 'Unknown answer format';
            }

            detailedResults.push({
                questionText: question.text,
                userAnswer: userAnswer,
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                questionType: question.type,
                explanation: question.explanation || "No explanation available"
            });
        }

        return {
            score,
            correctAnswers,
            totalQuestions,
            detailedResults
        };
    }

    /**
     * Check if there's a saved session
     */
    hasSavedSession() {
        // Implementation would check localStorage for saved quiz state
        return false;
    }

    /**
     * Resume a saved session
     */
    resumeSavedSession() {
        // Implementation would restore from localStorage
        return null;
    }

    /**
     * Clear saved state
     */
    clearSavedState() {
        // Implementation would clear localStorage
    }
}

// Make the quiz manager available globally
if (typeof window !== 'undefined') {
    window.QuizManager = QuizManager;

    // Create an instance only if one doesn't already exist
    if (!window.quizManager) {
        window.quizManager = new QuizManager();
    }
}

// Export for module systems
if (typeof module !== 'undefined') {
    module.exports = { QuizManager };
}