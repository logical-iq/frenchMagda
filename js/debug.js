/**
 * Debug script for French Grammar Quiz
 * Helps identify issues with quiz loading and data
 */

(function () {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function () {
    console.log('Debug script loaded');

    // Verify data availability
    console.log('Quiz data available:', !!window.quizData);
    console.log('Quiz categories available:', !!window.quizCategories);

    if (window.quizCategories) {
      console.log('Category IDs:', window.quizCategories.map(cat => cat.id));
    }

    if (window.quizData) {
      console.log('Quiz data keys:', Object.keys(window.quizData));
    }

    // Monkey patch startQuiz to provide more debug info
    if (window.QuizRenderer && window.QuizRenderer.prototype) {
      const originalStartQuiz = window.QuizRenderer.prototype.startQuiz;

      window.QuizRenderer.prototype.startQuiz = function (categoryId) {
        console.log('QuizRenderer.startQuiz called with:', categoryId);

        try {
          const result = originalStartQuiz.call(this, categoryId);
          console.log('Quiz started successfully:', this.quizTitle.textContent);
          return result;
        } catch (error) {
          console.error('Error starting quiz:', error);
          alert('Error starting quiz: ' + error.message);
          throw error;
        }
      };
    }

    // Add click debugging for category cards
    setTimeout(() => {
      const categoryCards = document.querySelectorAll('.category-card');
      console.log(`Found ${categoryCards.length} category cards`);

      categoryCards.forEach((card, index) => {
        const button = card.querySelector('.start-quiz-btn');
        if (button) {
          const categoryId = button.dataset.category;
          console.log(`Card ${index + 1} for category: ${categoryId}`);
        }
      });
    }, 1000);
  });
})();
