/**
 * French Grammar Quiz - Main Application
 */

document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM loaded - initializing app");

  // Initialize the quiz manager with quiz data
  const quizManager = window.quizManager || new QuizManager();

  // Initialize the quiz renderer with the quiz manager
  const quizRenderer = new QuizRenderer(quizManager);

  // Get the container element
  const categoryContainer = document.querySelector('#category-selection .grid');

  // Check if the container exists
  if (!categoryContainer) {
    console.error("Category container not found!");
    return;
  }

  // Check if quizCategories is available
  if (!window.quizCategories) {
    console.error("Quiz categories not found!");
    return;
  }

  // Setup navigation buttons
  const homeNavBtn = document.getElementById('home-nav-btn');
  if (homeNavBtn) {
    homeNavBtn.addEventListener('click', () => {
      quizRenderer.showCategories();
    });
  }

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to return to the home screen? Your progress will be saved.')) {
        quizRenderer.showCategories();
      }
    });
  }

  // Initialize the AI components if available
  initializeAi();

  // Use the quizRenderer's renderCategoryCards method with a callback that correctly passes just the category ID
  quizRenderer.renderCategoryCards(categoryContainer, function (categoryId) {
    console.log("Starting quiz for category:", categoryId);
    quizRenderer.startQuiz(categoryId);
  });

  // Track quiz completions to update user profile for AI
  document.addEventListener('quizCompleted', function (event) {
    console.log('Quiz completed event received:', event.detail);

    if (window.aiQuizGenerator) {
      // Extract quiz details from the event
      const quizResult = {
        categoryId: event.detail.categoryId,
        quizId: event.detail.quizId,
        score: event.detail.score,
        totalQuestions: event.detail.totalQuestions,
        timestamp: Date.now()
      };

      // Save quiz results to history
      const quizHistory = JSON.parse(localStorage.getItem('quiz-history') || '[]');

      // Add the new quiz result
      quizHistory.push(quizResult);

      // Keep only the last 10 quiz results
      if (quizHistory.length > 10) {
        quizHistory.shift();
      }

      // Save to localStorage
      localStorage.setItem('quiz-history', JSON.stringify(quizHistory));

      console.log('Updated quiz history for AI learning');

      // Analyze strengths and weaknesses based on recent quiz results
      analyzeUserPerformance(quizHistory);
    }
  });
});

/**
 * Initialize the AI components if available
 */
function initializeAi() {
  try {
    // Create AI Quiz Generator instance
    if (typeof AiQuizGenerator !== 'undefined') {
      console.log('Initializing AI Quiz Generator');
      window.aiQuizGenerator = new AiQuizGenerator();

      // Initialize AiQuizUI if available
      if (typeof AiQuizUI !== 'undefined') {
        console.log('Initializing AI Quiz UI');
        window.aiQuizUI = new AiQuizUI(window.aiQuizGenerator, window.quizManager, window.quizRenderer);
      }

      // Initialize AiTutorDialog if available
      if (typeof AiTutorDialog !== 'undefined') {
        console.log('Initializing AI Tutor Dialog');
        window.aiTutorDialog = new AiTutorDialog(window.aiQuizGenerator);
      }
    }
  } catch (error) {
    console.error('Failed to initialize AI components:', error);
  }
}

/**
 * Analyze user performance to update strengths and weaknesses
 * @param {Array} quizHistory - Array of quiz results
 */
function analyzeUserPerformance(quizHistory) {
  if (!quizHistory || quizHistory.length === 0) return;

  // Create category performance tracking
  const categoryPerformance = {};

  // Process each quiz result
  quizHistory.forEach(result => {
    const categoryId = result.categoryId;
    const score = result.score;
    const totalQuestions = result.totalQuestions || 5; // Default to 5 if not provided
    const percentage = score / totalQuestions;

    // Initialize category if not exists
    if (!categoryPerformance[categoryId]) {
      categoryPerformance[categoryId] = {
        totalScore: 0,
        quizCount: 0,
        averagePercentage: 0
      };
    }

    // Update category performance
    categoryPerformance[categoryId].totalScore += percentage;
    categoryPerformance[categoryId].quizCount += 1;
    categoryPerformance[categoryId].averagePercentage =
      categoryPerformance[categoryId].totalScore / categoryPerformance[categoryId].quizCount;
  });

  // Determine strengths and weaknesses
  const strengths = [];
  const weaknesses = [];

  for (const categoryId in categoryPerformance) {
    const performance = categoryPerformance[categoryId];

    // Categories with 75%+ average are strengths
    if (performance.averagePercentage >= 0.75 && performance.quizCount >= 2) {
      strengths.push(categoryId);
    }

    // Categories with below 60% average are weaknesses
    if (performance.averagePercentage < 0.6 && performance.quizCount >= 2) {
      weaknesses.push(categoryId);
    }
  }

  // Update localStorage with new strengths and weaknesses
  localStorage.setItem('user-strengths', strengths.join(','));
  localStorage.setItem('user-weaknesses', weaknesses.join(','));

  console.log('Updated user profile - Strengths:', strengths, 'Weaknesses:', weaknesses);
}