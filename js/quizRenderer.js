/**
 * French Grammar Quiz - Quiz Renderer Module
 * Handles rendering different question types to the UI
 */

class QuizRenderer {
    constructor(quizManager) {
        this.quizManager = quizManager;

        // DOM elements
        this.categorySection = document.getElementById('category-selection');
        this.quizContainer = document.getElementById('quiz-container');
        this.resultsContainer = document.getElementById('results-container');
        this.questionContainer = document.getElementById('question-container');
        this.optionsContainer = document.getElementById('options-container');
        this.quizTitle = document.getElementById('quiz-title');
        this.quizProgress = document.getElementById('quiz-progress');
        this.prevButton = document.getElementById('prev-btn');
        this.nextButton = document.getElementById('next-btn');

        // Navigation elements
        this.backButton = document.getElementById('back-btn');
        this.homeNavBtn = document.getElementById('home-nav-btn');

        // Results elements
        this.scoreDisplay = document.getElementById('score-display');
        this.resultDetails = document.getElementById('result-details');
        this.retryButton = document.getElementById('retry-btn');
        this.homeButton = document.getElementById('home-btn');

        // Initialize event listeners
        this.initEventListeners();
    }

    /**
     * Set up event listeners for quiz navigation
     */
    initEventListeners() {
        // Back button in the navigation bar
        if (this.backButton) {
            this.backButton.addEventListener('click', () => {
                if (this.quizContainer && !this.quizContainer.classList.contains('hidden')) {
                    if (confirm('Are you sure you want to return to the home screen? Your progress will be saved.')) {
                        this.showCategories();
                    }
                } else if (this.resultsContainer && !this.resultsContainer.classList.contains('hidden')) {
                    this.showCategories();
                }
            });
        }

        // Previous question button
        this.prevButton.addEventListener('click', () => {
            this.saveCurrentAnswer();
            const prevQuestion = this.quizManager.previousQuestion();
            if (prevQuestion) {
                this.renderQuestion(prevQuestion);
                this.updateButtonStates();
            }
        });

        // Next question button
        this.nextButton.addEventListener('click', () => {
            this.saveCurrentAnswer();

            const nextQuestion = this.quizManager.nextQuestion();
            if (nextQuestion) {
                this.renderQuestion(nextQuestion);
            } else {
                // No more questions, show results
                this.showResults();
            }

            this.updateButtonStates();
        });

        // Retry quiz button
        this.retryButton.addEventListener('click', () => {
            // Reset the current quiz and start over
            if (this.quizManager.currentQuiz) {
                const categoryId = this.quizManager.currentQuiz.id;
                this.quizManager.resetQuiz();
                this.startQuiz(categoryId);
            }
        });

        // Home button
        this.homeButton.addEventListener('click', () => {
            this.showCategories();
        });

        // Home navigation button
        if (this.homeNavBtn) {
            this.homeNavBtn.addEventListener('click', () => {
                if (this.quizContainer && !this.quizContainer.classList.contains('hidden')) {
                    if (confirm('Are you sure you want to return to the home screen? Your progress will be saved.')) {
                        this.showCategories();
                    }
                } else {
                    this.showCategories();
                }
            });
        }

        // Print results button
        const printButton = document.getElementById('print-btn');
        if (printButton) {
            printButton.addEventListener('click', () => {
                this.printResults();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard shortcuts when a quiz is active
            if (!this.quizManager.currentQuiz) return;

            // Don't trigger shortcuts when user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case 'ArrowLeft':
                    // Previous question (Left arrow)
                    if (!this.prevButton.disabled) {
                        this.prevButton.click();
                    }
                    break;

                case 'ArrowRight':
                case 'Enter':
                    // Next question (Right arrow or Enter)
                    this.nextButton.click();
                    break;

                case 'Escape':
                    // Return to home (Escape)
                    if (this.resultsContainer.classList.contains('hidden')) {
                        // Show a confirmation dialog if in the middle of a quiz
                        if (confirm('Are you sure you want to exit this quiz? Your progress will be saved.')) {
                            this.showCategories();
                        }
                    } else {
                        // If on results screen, just go home
                        this.homeButton.click();
                    }
                    break;
            }
        });
    }

    /**
     * Render all available quiz categories
     */
    renderCategories() {
        const categories = this.quizManager.getCategories();
        const categoryGrid = this.categorySection.querySelector('div');

        // Clear existing categories
        categoryGrid.innerHTML = '';

        // Create a card for each category
        categories.forEach((category, index) => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-5 flex flex-col h-full transform hover:-translate-y-1 opacity-0';
            card.style.animationDelay = `${index * 100}ms`;
            card.innerHTML = `
                <div class="text-3xl mb-4 text-primary">${category.icon}</div>
                <h3 class="text-lg font-semibold mb-3">${category.title}</h3>
                <p class="text-gray-600 mb-5 flex-grow text-sm">${category.description}</p>
                <button class="start-quiz-btn w-full px-4 py-2.5 bg-primary text-white rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors mt-auto" 
                        data-category="${category.id}">
                    Start Quiz
                </button>
            `;

            // Add event listener to the button
            const button = card.querySelector('.start-quiz-btn');
            button.addEventListener('click', () => {
                this.startQuiz(category.id);
            });

            categoryGrid.appendChild(card);

            // Trigger animation after a small delay
            setTimeout(() => {
                card.classList.add('animate-fadeIn');
                card.classList.remove('opacity-0');
            }, 50 + (index * 100));
        });

        // Show the categories section
        this.showCategories();
    }

    /**
     * Start a quiz from a specific category
     * @param {string} categoryId - The ID of the category to start
     */
    startQuiz(categoryId) {
        try {
            const quiz = this.quizManager.startQuiz(categoryId);

            // Set the quiz title
            this.quizTitle.textContent = quiz.title;

            // Render the first question
            const firstQuestion = this.quizManager.getCurrentQuestion();
            this.renderQuestion(firstQuestion);

            // Update button states
            this.updateButtonStates();
            
            // Render the quiz tip if available
            this.renderQuizTip();

            // Show the quiz container
            this.showQuiz();
        } catch (error) {
            console.error('Error starting quiz:', error);
            alert('Error starting quiz: ' + error.message);
        }
    }

    /**
     * Render a question to the UI
     * @param {Object} question - The question object to render
     */
    renderQuestion(question) {
        // Update progress indicator
        this.updateProgress();

        // Render question text
        this.questionContainer.innerHTML = `
            <h3 class="text-lg font-medium mb-4">${question.text}</h3>
            ${question.imageUrl ? `<img src="${question.imageUrl}" alt="Question Image" class="mb-4 max-w-full rounded-md">` : ''}
        `;

        // Render answer options based on question type
        switch (question.type) {
            case 'multiple-choice':
                this.renderMultipleChoice(question);
                break;

            case 'fill-in-blank':
                this.renderFillInBlanks(question);
                break;

            case 'text-input':
                this.renderTextInput(question);
                break;

            case 'matching':
                this.renderMatching(question);
                break;

            case 'free-writing':
                this.renderFreeWriting(question);
                break;

            default:
                this.optionsContainer.innerHTML = '<p class="text-red-500">Unknown question type</p>';
        }

        // Load any previously saved answer
        this.loadSavedAnswer();

        // Setup touch swipe gestures for mobile navigation
        this.setupSwipeGestures();
    }

    /**
     * Set up swipe gestures for mobile navigation
     */
    setupSwipeGestures() {
        const container = this.quizContainer;
        let touchStartX = 0;
        let touchEndX = 0;

        const handleTouchStart = (event) => {
            touchStartX = event.changedTouches[0].screenX;
        };

        const handleTouchEnd = (event) => {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipe();
        };

        const handleSwipe = () => {
            const minSwipeDistance = 50; // Minimum swipe distance in pixels

            // Swipe right to left (next)
            if (touchStartX - touchEndX > minSwipeDistance && !this.nextButton.disabled) {
                this.nextButton.click();
            }

            // Swipe left to right (previous)
            if (touchEndX - touchStartX > minSwipeDistance && !this.prevButton.disabled) {
                this.prevButton.click();
            }
        };

        // Remove existing listeners to prevent duplication
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);

        // Add touch event listeners
        container.addEventListener('touchstart', handleTouchStart, false);
        container.addEventListener('touchend', handleTouchEnd, false);
    }

    /**
     * Show solution for the current question
     * @param {Object} question - The current question object
     * @private
     */
    showSolution(question) {
        // Remove any existing solution
        const existingSolution = this.optionsContainer.querySelector('.answer-solution');
        if (existingSolution) {
            existingSolution.remove();
        }
        
        // Create solution container
        const solutionDiv = document.createElement('div');
        solutionDiv.className = 'answer-solution mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-md';
        
        // Generate solution content based on question type
        let solutionContent = '';
        
        switch (question.type) {
            case 'multiple-choice':
                solutionContent = `
                    <p class="text-sm font-semibold text-gray-700 mb-1">Correct Answer${question.correctAnswers.length > 1 ? 's' : ''}:</p>
                    <ul class="text-sm text-gray-700 list-disc pl-5">
                        ${question.options
                            .filter(option => question.correctAnswers.includes(option.id))
                            .map(option => `<li>${option.text}</li>`)
                            .join('')}
                    </ul>
                `;
                break;
                
            case 'fill-in-blank':
                solutionContent = `
                    <p class="text-sm font-semibold text-gray-700 mb-1">Correct Answer${question.blanks.length > 1 ? 's' : ''}:</p>
                    <ul class="text-sm text-gray-700 list-disc pl-5">
                        ${question.blanks.map(blank => {
                            let answers = [blank.answer];
                            if (question.alternativeAnswers && question.alternativeAnswers[blank.id]) {
                                answers = answers.concat(question.alternativeAnswers[blank.id]);
                            }
                            return `<li>${blank.id}: ${answers.join(' or ')}</li>`;
                        }).join('')}
                    </ul>
                `;
                break;
                
            case 'text-input':
                let answers = [question.correctAnswer];
                if (question.alternativeAnswers) {
                    answers = answers.concat(question.alternativeAnswers);
                }
                solutionContent = `
                    <p class="text-sm font-semibold text-gray-700 mb-1">Correct Answer${answers.length > 1 ? 's' : ''}:</p>
                    <ul class="text-sm text-gray-700 list-disc pl-5">
                        ${answers.map(answer => `<li>${answer}</li>`).join('')}
                    </ul>
                `;
                break;
                
            case 'matching':
                solutionContent = `
                    <p class="text-sm font-semibold text-gray-700 mb-1">Correct Matches:</p>
                    <ul class="text-sm text-gray-700 list-disc pl-5">
                        ${question.pairs.map(pair => `<li>${pair.item} → ${pair.match}</li>`).join('')}
                    </ul>
                `;
                break;
                
            case 'free-writing':
                solutionContent = `
                    <p class="text-sm font-semibold text-gray-700 mb-1">Sample Answer:</p>
                    <div class="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                        ${question.sampleAnswer || 'No sample answer provided.'}
                    </div>
                `;
                break;
        }
        
        // Add explanation if available
        if (question.explanation) {
            solutionContent += `
                <div class="mt-3 pt-3 border-t border-gray-200">
                    <p class="text-sm font-semibold text-gray-700 mb-1">Explanation:</p>
                    <p class="text-sm text-gray-700">${question.explanation}</p>
                </div>
            `;
        }
        
        solutionDiv.innerHTML = solutionContent;
        this.optionsContainer.appendChild(solutionDiv);
    }

    /**
     * Render multiple choice question
     * @param {Object} question - The multiple choice question object
     */
    renderMultipleChoice(question) {
        const isSingleAnswer = question.correctAnswers.length === 1;
        const inputType = isSingleAnswer ? 'radio' : 'checkbox';

        let html = `<div class="space-y-3">`;

        question.options.forEach(option => {
            html += `
                <label class="flex items-start p-4 bg-gray-50 rounded-md hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-200 active:bg-blue-100" data-option-id="${option.id}">
                    <input type="${inputType}" name="mc-option" value="${option.id}" class="mt-1 mr-3 h-5 w-5" 
                           ${inputType === 'radio' ? 'data-single="true"' : ''}>
                    <span class="text-base">${option.text}</span>
                    <span class="feedback-icon ml-auto hidden"></span>
                </label>
            `;
        });

        html += `</div>`;
        this.optionsContainer.innerHTML = html;
        
        // Add submission button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors w-full';
        submitBtn.textContent = 'Submit Answer';
        this.optionsContainer.appendChild(submitBtn);
        
        // Add event listener for submit button
        submitBtn.addEventListener('click', () => {
            const optionLabels = this.optionsContainer.querySelectorAll('label');
            const selectedInputs = this.optionsContainer.querySelectorAll('input:checked');
            
            // If nothing selected, show alert and return
            if (selectedInputs.length === 0) {
                alert('Please select an answer');
                return;
            }
            
            // Disable all inputs and the submit button
            this.optionsContainer.querySelectorAll('input').forEach(input => {
                input.disabled = true;
            });
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50');
            
            // Mark all options as correct/incorrect
            optionLabels.forEach(label => {
                const optionId = label.dataset.optionId;
                const isCorrect = question.correctAnswers.includes(optionId);
                const feedbackIcon = label.querySelector('.feedback-icon');
                const isSelected = label.querySelector('input').checked;
                
                // Only show feedback for selected items or correct answers
                if (isSelected || isCorrect) {
                    feedbackIcon.classList.remove('hidden');
                    
                    if (isCorrect) {
                        feedbackIcon.innerHTML = '✓';
                        feedbackIcon.className = 'feedback-icon ml-auto text-green-600 font-bold';
                        label.classList.add('border-green-300', 'bg-green-50');
                        label.classList.remove('border-transparent', 'bg-gray-50');
                    } else if (isSelected) {
                        feedbackIcon.innerHTML = '✗';
                        feedbackIcon.className = 'feedback-icon ml-auto text-red-600 font-bold';
                        label.classList.add('border-red-300', 'bg-red-50');
                        label.classList.remove('border-transparent', 'bg-gray-50');
                    }
                }
            });
            
            // Store the answer
            this.saveCurrentAnswer();
            
            // Show the solution
            this.showSolution(question);
        });
    }

    /**
     * Render fill-in-the-blank question
     * @param {Object} question - The fill-in-the-blank question object
     */
    renderFillInBlanks(question) {
        // Create a copy of the question text
        let text = question.text;

        // Replace each blank placeholder with an input
        question.blanks.forEach((blank, index) => {
            const inputHTML = `<input type="text" id="${blank.id}" class="mx-1 p-1 border-b-2 border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none text-center w-32 md:w-40" placeholder="${blank.id}" style="min-width: 80px;">`;
            text = text.replace('________', inputHTML);
        });

        this.optionsContainer.innerHTML = `
            <div class="fill-blanks-container bg-white p-4 rounded-md shadow-sm">
                <p class="text-base md:text-lg mb-4">${text}</p>
                
                <div class="mt-4 text-sm text-gray-600">
                    <p>Fill in all blanks with the appropriate words/phrases.</p>
                </div>
            </div>
        `;

        // Add submission button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors w-full';
        submitBtn.textContent = 'Submit Answer';
        this.optionsContainer.appendChild(submitBtn);
        
        // Add event listeners for keyboard navigation
        question.blanks.forEach((blank, index) => {
            const input = document.getElementById(blank.id);
            if (!input) return;

            // Add keydown event for better form navigation
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();

                    // Find next input or go to next question
                    const nextInput = question.blanks[index + 1] ?
                        document.getElementById(question.blanks[index + 1].id) : null;

                    if (nextInput) {
                        nextInput.focus();
                    } else {
                        // If this is the last input, trigger submit
                        submitBtn.click();
                    }
                }
            });
        });
        
        // Add event listener for submit button
        submitBtn.addEventListener('click', () => {
            // Check if all fields are filled
            const inputs = question.blanks.map(blank => document.getElementById(blank.id));
            const allFilled = inputs.every(input => input.value.trim() !== '');
            
            if (!allFilled) {
                if (!confirm('Some fields are empty. Do you want to submit anyway?')) {
                    return;
                }
            }
            
            // Disable all inputs and the submit button
            inputs.forEach(input => {
                input.disabled = true;
                
                // Mark correct/incorrect
                const blankId = input.id;
                const blank = question.blanks.find(b => b.id === blankId);
                
                let isCorrect = false;
                if (input.value.trim().toLowerCase() === blank.answer.toLowerCase()) {
                    isCorrect = true;
                } else if (question.alternativeAnswers && question.alternativeAnswers[blankId]) {
                    isCorrect = question.alternativeAnswers[blankId].some(
                        alt => input.value.trim().toLowerCase() === alt.toLowerCase()
                    );
                }
                
                if (isCorrect) {
                    input.classList.add('border-green-500', 'bg-green-50');
                    input.classList.remove('border-gray-300');
                } else {
                    input.classList.add('border-red-500', 'bg-red-50');
                    input.classList.remove('border-gray-300');
                }
            });
            
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50');
            
            // Store the answer
            this.saveCurrentAnswer();
            
            // Show the solution
            this.showSolution(question);
        });
    }

    /**
     * Render text input question
     * @param {Object} question - The text input question object
     */
    renderTextInput(question) {
        this.optionsContainer.innerHTML = `
            <div class="text-input-container">
                <textarea id="text-answer" rows="4" 
                          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Type your answer here..."></textarea>
            </div>
        `;
        
        // Add submission button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors w-full';
        submitBtn.textContent = 'Submit Answer';
        this.optionsContainer.appendChild(submitBtn);
        
        // Add event listener for submit button
        submitBtn.addEventListener('click', () => {
            const textInput = document.getElementById('text-answer');
            
            if (textInput.value.trim() === '') {
                if (!confirm('Your answer is empty. Do you want to submit anyway?')) {
                    return;
                }
            }
            
            // Disable input and the submit button
            textInput.disabled = true;
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50');
            
            // Store the answer
            this.saveCurrentAnswer();
            
            // Show the solution
            this.showSolution(question);
        });
    }

    /**
     * Render matching question
     * @param {Object} question - The matching question object
     */
    renderMatching(question) {
        // Create arrays of items and matches
        const items = question.pairs.map(pair => pair.item);
        const matches = question.pairs.map(pair => pair.match);

        // Shuffle the matches array for display
        const shuffledMatches = [...matches].sort(() => Math.random() - 0.5);

        let html = `<div class="matching-container">`;

        // Create a row for each item with a dropdown of possible matches
        question.pairs.forEach(pair => {
            html += `
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 bg-gray-50 p-3 rounded-md">
                    <span class="font-medium mb-2 sm:mb-0">${pair.item}</span>
                    <select id="${pair.id}" class="w-full sm:w-auto sm:ml-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">-- Select match --</option>
                        ${shuffledMatches.map(match => `<option value="${match}">${match}</option>`).join('')}
                    </select>
                </div>
            `;
        });

        html += `</div>`;
        this.optionsContainer.innerHTML = html;
        
        // Add submission button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors w-full';
        submitBtn.textContent = 'Submit Answer';
        this.optionsContainer.appendChild(submitBtn);
        
        // Add event listener for submit button
        submitBtn.addEventListener('click', () => {
            const selects = question.pairs.map(pair => document.getElementById(pair.id));
            const allSelected = selects.every(select => select.value !== '');
            
            if (!allSelected) {
                if (!confirm('Not all items are matched. Do you want to submit anyway?')) {
                    return;
                }
            }
            
            // Disable all selects and the submit button
            selects.forEach(select => {
                select.disabled = true;
                
                // Mark correct/incorrect
                const pairId = select.id;
                const pair = question.pairs.find(p => p.id === pairId);
                
                if (select.value === pair.match) {
                    select.classList.add('border-green-500', 'bg-green-50');
                    select.classList.remove('border-gray-300');
                } else {
                    select.classList.add('border-red-500', 'bg-red-50');
                    select.classList.remove('border-gray-300');
                }
            });
            
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50');
            
            // Store the answer
            this.saveCurrentAnswer();
            
            // Show the solution
            this.showSolution(question);
        });
    }

    /**
     * Render free writing question
     * @param {Object} question - The free writing question object
     */
    renderFreeWriting(question) {
        const { minWords, maxWords, guidance } = question;

        this.optionsContainer.innerHTML = `
            <div class="free-writing-container">
                <textarea id="free-writing-answer" rows="8" 
                          class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Write your response here..."></textarea>
                
                <div class="mt-2 text-sm text-gray-600">
                    <p>Word count: <span id="word-count">0</span> 
                       ${minWords ? `(minimum: ${minWords} words)` : ''}
                       ${maxWords ? `(maximum: ${maxWords} words)` : ''}
                    </p>
                </div>
                
                ${guidance ? `
                <div class="mt-4 bg-blue-50 p-3 rounded-md">
                    <p class="text-sm font-medium mb-1">Guidance:</p>
                    <p class="text-sm text-gray-700">${guidance}</p>
                </div>` : ''}
            </div>
        `;
        
        // Add submission button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors w-full';
        submitBtn.textContent = 'Submit Answer';
        this.optionsContainer.appendChild(submitBtn);

        // Add word count functionality
        const textarea = document.getElementById('free-writing-answer');
        const wordCountEl = document.getElementById('word-count');

        textarea.addEventListener('input', () => {
            const text = textarea.value;
            const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
            wordCountEl.textContent = wordCount;

            // Visual feedback for word count
            if (minWords && wordCount < minWords) {
                wordCountEl.className = 'text-red-500 font-medium';
            } else if (maxWords && wordCount > maxWords) {
                wordCountEl.className = 'text-red-500 font-medium';
            } else {
                wordCountEl.className = 'text-green-500 font-medium';
            }
        });
        
        // Add event listener for submit button
        submitBtn.addEventListener('click', () => {
            const text = textarea.value.trim();
            const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
            
            if (text === '') {
                if (!confirm('Your response is empty. Do you want to submit anyway?')) {
                    return;
                }
            } else if (minWords && wordCount < minWords) {
                if (!confirm(`You've written ${wordCount} words, which is less than the minimum ${minWords}. Submit anyway?`)) {
                    return;
                }
            } else if (maxWords && wordCount > maxWords) {
                if (!confirm(`You've written ${wordCount} words, which exceeds the maximum ${maxWords}. Submit anyway?`)) {
                    return;
                }
            }
            
            // Disable textarea and the submit button
            textarea.disabled = true;
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50');
            
            // Store the answer
            this.saveCurrentAnswer();
            
            // Show the solution
            this.showSolution(question);
        });
    }

    /**
     * Save the current answer before navigating away
     */
    saveCurrentAnswer() {
        const question = this.quizManager.getCurrentQuestion();
        let answer = null;

        switch (question.type) {
            case 'multiple-choice':
                const inputs = this.optionsContainer.querySelectorAll('input');
                const isSingle = inputs.length > 0 && inputs[0].dataset.single === 'true';

                if (isSingle) {
                    // Single answer (radio button)
                    const selected = this.optionsContainer.querySelector('input:checked');
                    answer = selected ? selected.value : null;
                } else {
                    // Multiple answers (checkboxes)
                    answer = [...inputs].filter(input => input.checked).map(input => input.value);
                }
                break;

            case 'fill-in-blank':
                answer = {};
                question.blanks.forEach(blank => {
                    const input = document.getElementById(blank.id);
                    if (input) {
                        answer[blank.id] = input.value;
                    }
                });
                break;

            case 'text-input':
                const textInput = document.getElementById('text-answer');
                answer = textInput ? textInput.value : '';
                break;

            case 'matching':
                answer = {};
                question.pairs.forEach(pair => {
                    const select = document.getElementById(pair.id);
                    if (select) {
                        answer[pair.id] = select.value;
                    }
                });
                break;

            case 'free-writing':
                const freeWritingInput = document.getElementById('free-writing-answer');
                answer = freeWritingInput ? freeWritingInput.value : '';
                break;
        }

        // Submit the answer to the quiz manager
        if (answer !== null) {
            this.quizManager.submitAnswer(answer);
        }
    }

    /**
     * Load a previously saved answer for the current question
     */
    loadSavedAnswer() {
        const question = this.quizManager.getCurrentQuestion();
        const savedAnswer = this.quizManager.userAnswers[this.quizManager.currentQuestionIndex];

        if (savedAnswer === null) {
            return; // No saved answer
        }

        switch (question.type) {
            case 'multiple-choice':
                if (Array.isArray(savedAnswer)) {
                    // Multiple answers (checkboxes)
                    savedAnswer.forEach(value => {
                        const input = this.optionsContainer.querySelector(`input[value="${value}"]`);
                        if (input) input.checked = true;
                    });
                } else {
                    // Single answer (radio button)
                    const input = this.optionsContainer.querySelector(`input[value="${savedAnswer}"]`);
                    if (input) input.checked = true;
                }
                break;

            case 'fill-in-blank':
                for (const blankId in savedAnswer) {
                    const input = document.getElementById(blankId);
                    if (input) {
                        input.value = savedAnswer[blankId];
                    }
                }
                break;

            case 'text-input':
                const textInput = document.getElementById('text-answer');
                if (textInput) {
                    textInput.value = savedAnswer;
                }
                break;

            case 'matching':
                for (const pairId in savedAnswer) {
                    const select = document.getElementById(pairId);
                    if (select) {
                        select.value = savedAnswer[pairId];
                    }
                }
                break;

            case 'free-writing':
                const freeWritingInput = document.getElementById('free-writing-answer');
                if (freeWritingInput) {
                    freeWritingInput.value = savedAnswer;
                    // Trigger the input event to update word count
                    const event = new Event('input', { bubbles: true });
                    freeWritingInput.dispatchEvent(event);
                }
                break;
        }
    }

    /**
     * Show the quiz results screen
     */
    showResults() {
        // Calculate results
        const results = this.quizManager.calculateResults();

        // Update the score display
        this.scoreDisplay.innerHTML = `
            <div class="text-4xl font-bold ${results.score >= 70 ? 'text-green-500' : results.score >= 50 ? 'text-yellow-500' : 'text-red-500'} mb-2">
                ${results.score}%
            </div>
            <div class="text-gray-600">
                You answered ${results.correctAnswers} out of ${results.totalQuestions} questions correctly.
            </div>
        `;

        // Clear previous results
        this.resultDetails.innerHTML = '';

        // Add detailed results for each question
        results.detailedResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'mb-6 p-4 border rounded-md ' +
                (result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50');

            resultItem.innerHTML = `
                <div class="flex items-start justify-between mb-3">
                    <h4 class="text-lg font-medium">${index + 1}. ${result.questionText}</h4>
                    <span class="ml-2 ${result.isCorrect ? 'text-green-600' : 'text-red-600'} text-xl">
                        ${result.isCorrect ? '✓' : '✗'}
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div class="bg-white bg-opacity-60 p-3 rounded-md">
                        <p class="text-sm font-semibold text-gray-700 mb-2">Your Answer:</p>
                        <div class="text-sm">${this.formatAnswerForResults(result)}</div>
                    </div>
                    <div class="bg-white bg-opacity-60 p-3 rounded-md">
                        <p class="text-sm font-semibold text-gray-700 mb-2">Correct Answer:</p>
                        <div class="text-sm">${this.formatCorrectAnswer(result)}</div>
                    </div>
                </div>
                ${result.explanation ? `
                    <div class="mt-3 pt-3 border-t border-gray-200">
                        <p class="text-sm font-semibold text-gray-700 mb-1">Explanation:</p>
                        <p class="text-sm">${result.explanation}</p>
                    </div>
                ` : ''}
            `;

            this.resultDetails.appendChild(resultItem);
        });

        // Show the results container
        this.categorySection.classList.add('hidden');
        this.quizContainer.classList.add('hidden');
        this.resultsContainer.classList.remove('hidden');

        // Show back button on results page
        if (this.backButton) {
            this.backButton.classList.remove('hidden');
        }

        // Emit event with quiz results for AI to learn from
        const quizCompletedEvent = new CustomEvent('quizCompleted', {
            detail: {
                quizId: this.quizManager.currentQuiz?.id,
                categoryId: this.quizManager.currentQuiz?.id.split('-')[0],
                results: {
                    score: results.score,
                    correctAnswers: results.correctAnswers,
                    totalQuestions: results.totalQuestions,
                    questions: results.detailedResults.map(result => ({
                        questionText: result.questionText,
                        isCorrect: result.isCorrect,
                        questionType: result.questionType
                    }))
                }
            }
        });
        document.dispatchEvent(quizCompletedEvent);
    }

    /**
     * Format the answer for display in results
     * @param {Object} result - Result object for a question
     * @returns {string} HTML formatted answer
     */
    formatAnswerForResults(result) {
        const { userAnswer, questionType } = result;

        if (userAnswer === null || userAnswer === undefined) {
            return '<span class="text-gray-500">No answer provided</span>';
        }

        switch (questionType) {
            case 'multiple-choice':
                if (Array.isArray(userAnswer)) {
                    return userAnswer.join(', ');
                }
                return userAnswer;

            case 'fill-in-blank':
                if (typeof userAnswer !== 'object') {
                    return '<span class="text-gray-500">Answer format error</span>';
                }

                let blanksHtml = '';
                for (const blankId in userAnswer) {
                    if (Object.prototype.hasOwnProperty.call(userAnswer, blankId)) {
                        const value = userAnswer[blankId] || '<span class="text-gray-500">No answer</span>';
                        blanksHtml += `<div class="mb-1"><span class="font-medium">${blankId}:</span> ${value}</div>`;
                    }
                }
                return blanksHtml || '<span class="text-gray-500">No answers provided</span>';

            case 'text-input':
                return userAnswer;

            case 'matching':
                if (typeof userAnswer !== 'object') {
                    return '<span class="text-gray-500">Answer format error</span>';
                }

                let matchingHtml = '';
                for (const itemId in userAnswer) {
                    if (Object.prototype.hasOwnProperty.call(userAnswer, itemId)) {
                        const value = userAnswer[itemId] || '<span class="text-gray-500">Not matched</span>';
                        matchingHtml += `<div class="mb-1"><span class="font-medium">${itemId}</span> → ${value}</div>`;
                    }
                }
                return matchingHtml || '<span class="text-gray-500">No matches provided</span>';

            case 'free-writing':
                return `<div class="whitespace-pre-wrap">${userAnswer}</div>`;

            default:
                return String(userAnswer);
        }
    }

    /**
     * Format the correct answer for display in results
     * @param {Object} result - Result object for a question
     * @returns {string} HTML formatted correct answer
     */
    formatCorrectAnswer(result) {
        const { correctAnswer, questionType } = result;

        if (!correctAnswer) {
            return '<span class="text-gray-500">No answer available</span>';
        }

        switch (questionType) {
            case 'multiple-choice':
                if (typeof correctAnswer === 'string') {
                    return correctAnswer;
                } else if (Array.isArray(correctAnswer)) {
                    return correctAnswer.join(', ');
                }
                return String(correctAnswer);

            case 'fill-in-blank':
                if (typeof correctAnswer !== 'object') {
                    return '<span class="text-gray-500">Answer format error</span>';
                }

                let blanksHtml = '';
                for (const blankId in correctAnswer) {
                    if (Object.prototype.hasOwnProperty.call(correctAnswer, blankId)) {
                        blanksHtml += `<div class="mb-1"><span class="font-medium">${blankId}:</span> ${correctAnswer[blankId]}</div>`;
                    }
                }
                return blanksHtml || '<span class="text-gray-500">No blanks data available</span>';

            case 'text-input':
                return correctAnswer;

            case 'matching':
                if (typeof correctAnswer !== 'object') {
                    return '<span class="text-gray-500">Answer format error</span>';
                }

                let matchingHtml = '';
                for (const itemId in correctAnswer) {
                    if (Object.prototype.hasOwnProperty.call(correctAnswer, itemId)) {
                        matchingHtml += `<div class="mb-1"><span class="font-medium">${itemId}</span> → ${correctAnswer[itemId]}</div>`;
                    }
                }
                return matchingHtml || '<span class="text-gray-500">No matching data available</span>';

            case 'free-writing':
                return `<div class="whitespace-pre-wrap">${correctAnswer}</div>`;

            default:
                return String(correctAnswer);
        }
    }

    /**
     * Show the categories selection view
     */
    showCategories() {
        this.categorySection.classList.remove('hidden');
        this.quizContainer.classList.add('hidden');
        this.resultsContainer.classList.add('hidden');

        // Hide back button on home screen
        if (this.backButton) {
            this.backButton.classList.add('hidden');
        }
    }

    /**
     * Show the quiz view
     */
    showQuiz() {
        this.categorySection.classList.add('hidden');
        this.quizContainer.classList.remove('hidden');
        this.resultsContainer.classList.add('hidden');

        // Show back button when in quiz
        if (this.backButton) {
            this.backButton.classList.remove('hidden');
        }
    }

    /**
     * Update the quiz progress indicator
     */
    updateProgress() {
        const progress = this.quizManager.getProgress();
        this.quizProgress.textContent = `Question ${progress.current} of ${progress.total}`;

        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const percentage = (progress.current / progress.total) * 100;
            progressBar.style.width = `${percentage}%`;

            // Change color based on progress
            if (percentage < 30) {
                progressBar.classList.remove('bg-yellow-500', 'bg-green-500');
                progressBar.classList.add('bg-primary');
            } else if (percentage < 70) {
                progressBar.classList.remove('bg-primary', 'bg-green-500');
                progressBar.classList.add('bg-yellow-500');
            } else {
                progressBar.classList.remove('bg-primary', 'bg-yellow-500');
                progressBar.classList.add('bg-green-500');
            }
        }
    }

    /**
     * Update the navigation button states based on current position
     */
    updateButtonStates() {
        const progress = this.quizManager.getProgress();

        // Disable previous button if on first question
        this.prevButton.disabled = progress.current <= 1;
        this.prevButton.classList.toggle('opacity-50', progress.current <= 1);

        // Change next button text if on last question
        if (progress.current === progress.total) {
            this.nextButton.textContent = 'Finish Quiz';
            this.nextButton.classList.add('bg-green-500', 'hover:bg-green-600');
            this.nextButton.classList.remove('bg-primary', 'hover:bg-blue-600');
        } else {
            this.nextButton.textContent = 'Next';
            this.nextButton.classList.remove('bg-green-500', 'hover:bg-green-600');
            this.nextButton.classList.add('bg-primary', 'hover:bg-blue-600');
        }
    }

    /**
     * Print the quiz results
     */
    printResults() {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        // Get quiz info
        const quizTitle = this.quizManager.currentQuiz?.title || 'French Grammar Quiz';
        const date = new Date().toLocaleDateString();
        const results = this.quizManager.calculateResults();

        // Create print-friendly content
        let printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Quiz Results - ${quizTitle}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
                    .header { border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
                    .score { text-align: center; margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 5px; }
                    .question { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                    .correct { border-left: 5px solid #4ade80; }
                    .incorrect { border-left: 5px solid #f87171; }
                    .explanation { background: #f0f4f8; padding: 10px; margin-top: 10px; font-size: 0.9em; }
                    @media print {
                        body { font-size: 12pt; }
                        .no-print { display: none; }
                        .question { page-break-inside: avoid; }
                        a { text-decoration: none; color: #333; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${quizTitle} - Results</h1>
                    <p>Date: ${date}</p>
                </div>
                
                <div class="score">
                    <h2>Score: ${results.score}%</h2>
                    <p>${results.correctAnswers} out of ${results.totalQuestions} questions correct</p>
                </div>
                
                <div class="details">
                    <h2>Detailed Results</h2>
        `;

        // Add each question and answer
        results.detailedResults.forEach((result, index) => {
            const resultClass = result.isCorrect ? 'correct' : 'incorrect';
            const resultText = result.isCorrect ? 'Correct' : 'Incorrect';

            printContent += `
                <div class="question ${resultClass}">
                    <h3>Question ${index + 1}: ${resultText}</h3>
                    <p>${result.questionText}</p>
                    
                    <div class="answer">
                        <p><strong>Your answer:</strong> ${this.formatAnswerForPrint(result.userAnswer, result.questionType)}</p>
                        ${!result.isCorrect ? `<p><strong>Correct answer:</strong> ${this.formatAnswerForPrint(result.correctAnswer, result.questionType)}</p>` : ''}
                    </div>
                    
                    ${result.explanation ? `<div class="explanation"><strong>Explanation:</strong> ${result.explanation}</div>` : ''}
                </div>
            `;
        });

        // Close the HTML structure
        printContent += `
                    <div class="no-print" style="margin-top: 30px; text-align: center;">
                        <button onclick="window.print()">Print</button>
                        <button onclick="window.close()">Close</button>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Write to the new window and prepare for printing
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();

        // Give the browser a moment to process the document before printing
        setTimeout(() => {
            printWindow.focus();
            // Uncomment the next line to automatically trigger print dialog
            // printWindow.print();
        }, 500);
    }

    /**
     * Format an answer for the print view
     * @param {*} answer - The answer to format
     * @param {string} questionType - The type of question
     * @returns {string} Formatted answer string
     */
    formatAnswerForPrint(answer, questionType) {
        if (!answer) return 'No answer provided';

        switch (questionType) {
            case 'multiple-choice':
                return Array.isArray(answer) ? answer.join(', ') : answer;

            case 'fill-in-blank':
            case 'matching':
                // Format object answers
                if (typeof answer === 'object') {
                    return Object.entries(answer)
                        .map(([key, value]) => `${key}: ${value || 'No answer'}`)
                        .join(', ');
                }
                return answer;

            case 'text-input':
            case 'free-writing':
                return answer;

            default:
                return JSON.stringify(answer);
        }
    }

    renderCategoryCards(container, onSelectCategory) {
        // Clear any existing content completely
        container.innerHTML = '';

        // Use quizCategories from window or from the quizManager if available
        let categories = [];
        if (window.quizCategories && Array.isArray(window.quizCategories)) {
            categories = window.quizCategories;
        } else if (this.quizManager && typeof this.quizManager.getCategories === 'function') {
            // Try to get categories from the quiz manager
            categories = this.quizManager.getCategories();
        }

        if (categories.length === 0) {
            console.error('No quiz categories found!');
            return;
        }

        categories.forEach((category, index) => {
            // Create gradient colors based on index to add variety
            const gradientClasses = [
                'from-blue-500 to-indigo-600',
                'from-emerald-500 to-teal-600',
                'from-violet-500 to-purple-600',
                'from-pink-500 to-rose-600',
                'from-amber-500 to-orange-600',
                'from-cyan-500 to-sky-600'
            ];

            const gradientClass = gradientClasses[index % gradientClasses.length];

            // Create category card
            const card = document.createElement('div');
            card.className = `category-card bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fadeIn border border-gray-100`;
            card.style.animationDelay = `${index * 0.1}s`;

            // Card content with a colored header and description section
            card.innerHTML = `
              <div class="h-3 bg-gradient-to-r ${gradientClass}"></div>
              <div class="p-6">
                <div class="flex items-start">
                  <div class="text-2xl mr-3">${category.icon || ''}</div>
                  <div>
                    <h3 class="font-bold text-lg mb-2 text-gray-800">${category.title}</h3>
                    <p class="text-gray-600 text-sm mb-4">${category.description || 'Practice your French grammar skills with this quiz.'}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs text-gray-500">${category.questionCount || 10} questions</span>
                  <div class="flex space-x-2">
                    <button class="ai-tutor-btn px-4 py-2 bg-gradient-to-r from-accent to-purple-500 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center" data-category="${category.id}">
                      <span class="mr-1">🤖</span> AI Tutor
                    </button>
                    <button class="start-quiz-btn px-4 py-2 bg-gradient-to-r ${gradientClass} text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity" data-category="${category.id}">
                      Start Quiz
                    </button>
                  </div>
                </div>
              </div>
            `;

            // Make the entire card clickable for better UX (except the buttons)
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on any button
                if (!e.target.closest('.start-quiz-btn') && !e.target.closest('.ai-tutor-btn')) {
                    const button = card.querySelector('.start-quiz-btn');
                    if (button) button.click();
                }
            });

            // Add click event for the regular quiz button
            const startButton = card.querySelector('.start-quiz-btn');
            startButton.addEventListener('click', (e) => {
                e.stopPropagation();
                // Pass only the category ID
                if (onSelectCategory) onSelectCategory(category.id);
            });

            // Add click event for the AI tutor button
            const aiTutorButton = card.querySelector('.ai-tutor-btn');
            aiTutorButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this._openAiTutorForCategory(category.id);
            });

            container.appendChild(card);
        });
    }

    /**
     * Open the AI tutor for a specific category
     * @param {string} categoryId - The ID of the category
     * @private
     */
    _openAiTutorForCategory(categoryId) {
        console.log(`Opening AI tutor for category: ${categoryId}`);

        // Check if we have the AiQuizGenerator class
        if (!window.AiQuizGenerator) {
            console.error('AiQuizGenerator class not available');
            alert('The AI tutor functionality is not available. Please make sure all required scripts are loaded.');
            return;
        }

        // Create the generator if it doesn't exist
        if (!window.aiQuizGenerator) {
            console.log('Creating new aiQuizGenerator instance');
            window.aiQuizGenerator = new AiQuizGenerator();
        }

        // Check if we have a proper AI Quiz Generator initialized
        if (!window.aiQuizGenerator.isInitialized) {
            console.log('AI generator not initialized, checking for saved API key');
            // If not initialized, try to find an API key in localStorage
            const savedApiKey = localStorage.getItem('gemini_api_key');
            if (savedApiKey) {
                console.log('Found saved API key, attempting to initialize');
                // Show a loading message to the user
                const loadingMsg = document.createElement('div');
                loadingMsg.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                loadingMsg.innerHTML = `
                    <div class="bg-white p-5 rounded-lg max-w-md text-center">
                        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-3"></div>
                        <p class="text-lg">Initializing AI Tutor...</p>
                    </div>
                `;
                document.body.appendChild(loadingMsg);

                // Try to initialize the AI generator with the saved key
                window.aiQuizGenerator.initialize(savedApiKey)
                    .then(() => {
                        console.log('Successfully initialized AI with saved key');
                        document.body.removeChild(loadingMsg);
                        this._openTutorDialog(categoryId);
                    })
                    .catch(error => {
                        console.error('Error initializing AI with saved key:', error);
                        document.body.removeChild(loadingMsg);
                        // Show a more user-friendly error
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                        errorMsg.innerHTML = `
                            <div class="bg-white p-5 rounded-lg max-w-md">
                                <h3 class="font-bold text-lg mb-3">AI Initialization Error</h3>
                                <p class="mb-4">Unable to initialize the AI tutor with your saved API key. You may need to provide a new key.</p>
                                <div class="flex justify-end">
                                    <button class="px-4 py-2 bg-primary text-white rounded-md">OK</button>
                                </div>
                            </div>
                        `;
                        document.body.appendChild(errorMsg);

                        // Add click event to close the error message
                        const okButton = errorMsg.querySelector('button');
                        okButton.addEventListener('click', () => {
                            document.body.removeChild(errorMsg);
                            this._showAiTutorDialog(categoryId);
                        });
                    });
            } else {
                console.log('No saved API key found, showing dialog');
                // No API key, show the simple dialog
                this._showAiTutorDialog(categoryId);
            }
        } else {
            console.log('AI is already initialized, opening tutor dialog');
            // AI is initialized, open the tutor dialog
            this._openTutorDialog(categoryId);
        }
    }

    /**
     * Open the AiTutorDialog for a specific category
     * @param {string} categoryId - The ID of the category
     * @private
     */
    _openTutorDialog(categoryId) {
        // Create the tutor dialog if it doesn't exist
        if (!window.aiTutorDialog) {
            window.aiTutorDialog = new AiTutorDialog(window.aiQuizGenerator);
        }

        // Open the dialog
        window.aiTutorDialog.open(categoryId);
    }

    /**
     * Show a simplified AI tutor dialog if full components aren't available
     * @param {string} categoryId - The ID of the category
     * @private
     */
    _showAiTutorDialog(categoryId) {
        // Create a modal dialog for AI tutor
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        // Format category name
        const categoryName = categoryId.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold flex items-center">
                        <span class="mr-2">🤖</span> AI French Tutor - ${categoryName}
                    </h2>
                    <button class="close-btn text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <p class="mb-4">The AI French Tutor will help you improve your skills in <strong>${categoryName}</strong> by generating personalized practice questions.</p>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">What's your proficiency level?</label>
                    <select id="simple-proficiency-level" class="w-full p-2 border border-gray-300 rounded-md">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-1">What would you like to focus on?</label>
                    <textarea id="focus-area" rows="3" class="w-full p-2 border border-gray-300 rounded-md" 
                        placeholder="Example: I struggle with conjugating -er verbs, or I want to practice articles with nouns..."></textarea>
                </div>
                
                <div class="flex justify-end space-x-3">
                    <button class="cancel-btn px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                    <button class="generate-btn px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 flex items-center">
                        <span class="mr-1">Generate Quiz</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const generateBtn = modal.querySelector('.generate-btn');

        const closeModal = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        generateBtn.addEventListener('click', () => {
            const proficiencyLevel = modal.querySelector('#simple-proficiency-level').value;
            const focusArea = modal.querySelector('#focus-area').value;

            // Show a processing message
            const modalContent = modal.querySelector('.bg-white');
            modalContent.innerHTML = `
                <div class="text-center py-8">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
                    <p class="text-lg">Generating your personalized ${categoryName} quiz...</p>
                    <p class="text-sm text-gray-600 mt-2">Please configure the AI Quiz Generator to enable this feature.</p>
                </div>
            `;

            // Close after a delay
            setTimeout(() => {
                closeModal();
                // Scroll to AI section to prompt setup
                const aiSection = document.getElementById('ai-quiz-section');
                if (aiSection) {
                    aiSection.scrollIntoView({ behavior: 'smooth' });
                    // Highlight the API key section
                    const apiKeyPrompt = document.getElementById('api-key-prompt');
                    if (apiKeyPrompt) apiKeyPrompt.click();
                }
            }, 2000);
        });
    }

    /**
     * Render the quiz tip if available
     */
    renderQuizTip() {
        if (this.currentQuiz && this.currentQuiz.tip) {
            // Create or find the tip container
            let tipContainer = document.getElementById('quiz-tip');
            
            if (!tipContainer) {
                tipContainer = document.createElement('div');
                tipContainer.id = 'quiz-tip';
                tipContainer.className = 'bg-blue-50 p-3 rounded-md mb-4 text-sm text-gray-700 border-l-4 border-blue-400';
                
                // Insert after the quiz title/progress area
                const titleArea = document.querySelector('#quiz-container .mb-4');
                if (titleArea && titleArea.nextSibling) {
                    this.quizContainer.insertBefore(tipContainer, titleArea.nextSibling);
                } else {
                    // Fallback - add to beginning of quiz container
                    this.quizContainer.prepend(tipContainer);
                }
            }
            
            // Add the tip content with a lightbulb icon
            tipContainer.innerHTML = `
                <div class="flex items-start">
                    <span class="text-blue-500 mr-2">💡</span>
                    <p>${this.currentQuiz.tip}</p>
                </div>
            `;
        }
    }
}

// Make the quiz renderer available globally
if (typeof window !== 'undefined') {
    window.QuizRenderer = QuizRenderer;
}

// Export for module systems
if (typeof module !== 'undefined') {
    module.exports = { QuizRenderer };
}