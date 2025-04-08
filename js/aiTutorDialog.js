/**
 * French Grammar Quiz - AI Tutor Dialog
 * Creates a chat-like interface for interacting with the AI French tutor
 */

class AiTutorDialog {
       constructor(aiQuizGenerator) {
              if (!aiQuizGenerator) {
                     throw new Error('AI Quiz Generator is required');
              }
              this.aiQuizGenerator = aiQuizGenerator;
              this.dialogElement = null;
              this.isOpen = false;
              this.categoryId = null;
              this.chatContainer = null;
              this.isProcessing = false;

              // Initialize dialog elements
              this._initializeEventListeners();

              console.log('AI Tutor Dialog initialized');
       }

       /**
        * Initialize event listeners for AI tutor buttons
        * @private
        */
       _initializeEventListeners() {
              // Listen for clicks on AI tutor buttons in category cards
              document.addEventListener('click', (event) => {
                     const tutorButton = event.target.closest('.ai-tutor-btn');
                     if (tutorButton) {
                            const categoryId = tutorButton.dataset.category;
                            if (categoryId) {
                                   this._handleTutorButtonClick(categoryId);
                            }
                     }
              });

              console.log('Event listeners for AI tutor initialized');
       }

       /**
        * Handle click on the AI tutor button
        * @param {string} categoryId - The ID of the selected category
        * @private
        */
       _handleTutorButtonClick(categoryId) {
              console.log(`AI tutor button clicked for category: ${categoryId}`);

              // Check if AI generator is initialized
              if (!this.aiQuizGenerator.isInitialized) {
                     console.log('AI not initialized, checking for API key');

                     // Check if there's a saved API key
                     const savedApiKey = localStorage.getItem('gemini-api-key');
                     const savedModel = localStorage.getItem('gemini-model');

                     if (savedApiKey) {
                            // Try to initialize with saved key
                            this.aiQuizGenerator.initialize(savedApiKey, savedModel)
                                   .then(() => {
                                          console.log('Initialized with saved key, opening tutor dialog');
                                          this._showAiTutorDialog(categoryId);
                                   })
                                   .catch(error => {
                                          console.error('Failed to initialize with saved key:', error);
                                          // Show API key setup dialog
                                          this._showAiTutorDialog(categoryId);
                                   });
                     } else {
                            // No saved key, show API key setup dialog
                            this._showAiTutorDialog(categoryId);
                     }
              } else {
                     // Already initialized, show tutor dialog directly
                     this._generateTutorSession(categoryId);
              }
       }

       /**
        * Shows the AI Tutor dialog for the selected category
        * @param {string} categoryId - The ID of the selected category
        */
       _showAiTutorDialog(categoryId) {
              // Create modal overlay
              const modalOverlay = document.createElement('div');
              modalOverlay.className = 'modal-overlay active';
              modalOverlay.id = 'ai-dialog-overlay';

              // Create modal container
              const modal = document.createElement('div');
              modal.className = 'modal-container';
              modal.innerHTML = `
                  <div class="modal-header">
                      <h2>AI Tutor Setup</h2>
                      <button class="close-button" id="close-ai-dialog">&times;</button>
                  </div>
                  <div class="modal-body">
                      <div class="setup-section">
                          <h3>Google Gemini API Key Required</h3>
                          <p>To use the AI Tutor, you need a Google Gemini API key.</p>
                          <ol>
                              <li>Visit <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a></li>
                              <li>Sign in with your Google account</li>
                              <li>Go to "Get API key" under your profile</li>
                              <li>Create a new API key and copy it</li>
                              <li>Paste it below</li>
                          </ol>
                          
                          <div class="input-group">
                              <label for="gemini-api-key">API Key:</label>
                              <input type="password" id="gemini-api-key" placeholder="Enter your Gemini API key" 
                                     class="api-key-input" value="${this.aiQuizGenerator.apiKey || ''}">
                              <button id="show-hide-key" type="button">Show</button>
                          </div>
                          
                          <div class="input-group">
                              <label for="gemini-model">AI Model:</label>
                              <select id="gemini-model" class="model-select">
                                  <option value="gemini-1.5-flash" ${this.aiQuizGenerator.selectedModelName === 'gemini-1.5-flash' ? 'selected' : ''}>
                                      Gemini 1.5 Flash (Faster)
                                  </option>
                                  <option value="gemini-1.5-pro" ${this.aiQuizGenerator.selectedModelName === 'gemini-1.5-pro' ? 'selected' : ''}>
                                      Gemini 1.5 Pro (Better)
                                  </option>
                                  <option value="gemini-pro" ${this.aiQuizGenerator.selectedModelName === 'gemini-pro' ? 'selected' : ''}>
                                      Gemini Pro (Legacy)
                                  </option>
                              </select>
                          </div>
                          
                          <div id="api-key-status" class="status-message"></div>
                      </div>
                  </div>
                  <div class="modal-footer">
                      <button id="cancel-ai-setup" class="button secondary-button">Cancel</button>
                      <button id="save-api-key" class="button primary-button">Save & Continue</button>
                  </div>
              `;

              // Add modal to the DOM
              modalOverlay.appendChild(modal);
              document.body.appendChild(modalOverlay);

              // Set up event listeners
              document.getElementById('close-ai-dialog').addEventListener('click', () => {
                     document.body.removeChild(modalOverlay);
              });

              document.getElementById('cancel-ai-setup').addEventListener('click', () => {
                     document.body.removeChild(modalOverlay);
              });

              // Toggle visibility of API key
              document.getElementById('show-hide-key').addEventListener('click', (e) => {
                     const apiKeyInput = document.getElementById('gemini-api-key');
                     if (apiKeyInput.type === 'password') {
                            apiKeyInput.type = 'text';
                            e.target.textContent = 'Hide';
                     } else {
                            apiKeyInput.type = 'password';
                            e.target.textContent = 'Show';
                     }
              });

              // Handle saving API key and model
              document.getElementById('save-api-key').addEventListener('click', async () => {
                     const apiKeyInput = document.getElementById('gemini-api-key');
                     const modelSelect = document.getElementById('gemini-model');
                     const statusElement = document.getElementById('api-key-status');

                     const apiKey = apiKeyInput.value.trim();
                     const modelName = modelSelect.value;

                     if (!apiKey) {
                            statusElement.textContent = 'Please enter an API key';
                            statusElement.className = 'status-message error';
                            return;
                     }

                     // Save API key and model to localStorage
                     localStorage.setItem('gemini-api-key', apiKey);
                     localStorage.setItem('gemini-model', modelName);

                     // Show loading state
                     const saveButton = document.getElementById('save-api-key');
                     const originalText = saveButton.textContent;
                     saveButton.textContent = 'Validating...';
                     saveButton.disabled = true;
                     statusElement.textContent = 'Validating API key...';
                     statusElement.className = 'status-message info';

                     try {
                            console.log(`Initializing AI with model: ${modelName}`);
                            await this.aiQuizGenerator.initialize(apiKey, modelName);

                            statusElement.textContent = 'API key validated successfully!';
                            statusElement.className = 'status-message success';

                            setTimeout(() => {
                                   document.body.removeChild(modalOverlay);

                                   // Generate a tutor session for the selected category
                                   if (categoryId) {
                                          this._generateTutorSession(categoryId);
                                   }
                            }, 1000);

                     } catch (error) {
                            console.error('API key validation failed:', error);
                            statusElement.textContent = `Error: ${error.message}`;
                            statusElement.className = 'status-message error';
                            saveButton.textContent = originalText;
                            saveButton.disabled = false;
                     }
              });
       }

       /**
        * Generates a tutor session for the selected category
        * @param {string} categoryId - The ID of the selected category
        * @private
        */
       async _generateTutorSession(categoryId) {
              try {
                     // Show loading indicator
                     this._showLoading('Preparing your French tutor session...');

                     // Get user profile data
                     const userProfile = this._getUserProfile();

                     // Update user profile in AI generator
                     this.aiQuizGenerator.updateUserProfile(userProfile);

                     console.log(`Generating tutor session for category: ${categoryId}`);
                     console.log('User profile:', userProfile);

                     // Generate personalized content
                     const tutorContent = await this.aiQuizGenerator.generateTutorSession(categoryId);

                     // Hide loading indicator
                     this._hideLoading();

                     // Show the tutor content
                     this._showTutorContent(tutorContent);

              } catch (error) {
                     console.error('Failed to generate tutor session:', error);
                     this._hideLoading();
                     this._showError(`Error generating tutor session: ${error.message}`);
              }
       }

       /**
        * Shows a loading indicator
        * @param {string} message - The loading message to display
        * @private
        */
       _showLoading(message) {
              // Remove existing loading indicator if any
              this._hideLoading();

              const loadingOverlay = document.createElement('div');
              loadingOverlay.className = 'loading-overlay';
              loadingOverlay.id = 'ai-loading-overlay';

              loadingOverlay.innerHTML = `
                  <div class="loading-container">
                      <div class="loading-spinner"></div>
                      <p>${message}</p>
                  </div>
              `;

              document.body.appendChild(loadingOverlay);
       }

       /**
        * Hides the loading indicator
        * @private
        */
       _hideLoading() {
              const existingOverlay = document.getElementById('ai-loading-overlay');
              if (existingOverlay) {
                     document.body.removeChild(existingOverlay);
              }
       }

       /**
        * Shows an error message
        * @param {string} message - The error message to display
        * @private
        */
       _showError(message) {
              const errorDialog = document.createElement('div');
              errorDialog.className = 'error-dialog';

              errorDialog.innerHTML = `
                  <div class="error-container">
                      <h3>Error</h3>
                      <p>${message}</p>
                      <button id="close-error">Close</button>
                  </div>
              `;

              document.body.appendChild(errorDialog);

              document.getElementById('close-error').addEventListener('click', () => {
                     document.body.removeChild(errorDialog);
              });
       }

       /**
        * Get user profile data for personalized tutor content
        * @private
        * @returns {Object} User profile data
        */
       _getUserProfile() {
              return {
                     proficiencyLevel: localStorage.getItem('proficiency-level') || 'beginner',
                     strengths: (localStorage.getItem('user-strengths') || '').split(',').filter(s => s.trim() !== ''),
                     weaknesses: (localStorage.getItem('user-weaknesses') || '').split(',').filter(w => w.trim() !== ''),
                     quizHistory: JSON.parse(localStorage.getItem('quiz-history') || '[]')
              };
       }

       /**
        * Show tutor content in a dialog
        * @param {Object} tutorContent - The tutor content to display
        * @private
        */
       _showTutorContent(tutorContent) {
              // Create modal overlay
              const modalOverlay = document.createElement('div');
              modalOverlay.className = 'modal-overlay active';
              modalOverlay.id = 'tutor-content-overlay';

              // Format the category name
              const categoryName = tutorContent.category
                     ? tutorContent.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                     : 'French';

              // Create modal container
              const modal = document.createElement('div');
              modal.className = 'modal-container tutor-content';
              modal.innerHTML = `
                  <div class="modal-header">
                      <h2>${categoryName} - AI French Tutor</h2>
                      <button class="close-button" id="close-tutor-content">&times;</button>
                  </div>
                  <div class="modal-body tutor-content-body">
                      ${tutorContent.content}
                  </div>
                  <div class="modal-footer">
                      <button id="close-tutor-session" class="button secondary-button">Close</button>
                      <button id="generate-practice-quiz" class="button primary-button" data-category="${tutorContent.category}">
                          Practice Quiz
                      </button>
                  </div>
              `;

              // Add modal to the DOM
              modalOverlay.appendChild(modal);
              document.body.appendChild(modalOverlay);

              // Set up event listeners
              document.getElementById('close-tutor-content').addEventListener('click', () => {
                     document.body.removeChild(modalOverlay);
              });

              document.getElementById('close-tutor-session').addEventListener('click', () => {
                     document.body.removeChild(modalOverlay);
              });

              // Add event listener for practice quiz button
              const practiceQuizButton = document.getElementById('generate-practice-quiz');
              if (practiceQuizButton) {
                     practiceQuizButton.addEventListener('click', () => {
                            document.body.removeChild(modalOverlay);

                            // Generate a practice quiz for this category
                            const category = practiceQuizButton.dataset.category;
                            this._generatePracticeQuiz(category);
                     });
              }
       }

       /**
        * Generate a practice quiz for the given category
        * @param {string} category - The category ID
        * @private
        */
       _generatePracticeQuiz(category) {
              // Check if we can delegate to AiQuizUI
              if (window.aiQuizUI && typeof window.aiQuizUI._handleGenerateQuiz === 'function') {
                     // Set the category in the UI if possible
                     const categorySelect = document.getElementById('ai-quiz-category');
                     if (categorySelect) {
                            for (let i = 0; i < categorySelect.options.length; i++) {
                                   if (categorySelect.options[i].value === category) {
                                          categorySelect.selectedIndex = i;
                                          break;
                                   }
                            }
                     }

                     // Trigger quiz generation
                     window.aiQuizUI._handleGenerateQuiz();
              } else {
                     // Fallback: start quiz directly if we have access to quizRenderer
                     this._showLoading('Generating practice quiz...');

                     this.aiQuizGenerator.generateQuiz(category, 5)
                            .then(quiz => {
                                   this._hideLoading();

                                   // Store the generated quiz in the global quiz data
                                   if (window.quizData) {
                                          // Generate a unique ID for the quiz if it doesn't have one
                                          if (!quiz.id) {
                                                 quiz.id = `ai-practice-${Date.now()}`;
                                          }

                                          // Add the quiz to the quiz data
                                          window.quizData[quiz.id] = quiz;

                                          // Start the quiz using the quiz renderer
                                          if (window.quizRenderer) {
                                                 window.quizRenderer.startQuiz(quiz.id);
                                          } else {
                                                 this._showError('Quiz renderer not found. Cannot start the quiz.');
                                          }
                                   } else {
                                          this._showError('Quiz data not found. Cannot start the quiz.');
                                   }
                            })
                            .catch(error => {
                                   console.error('Failed to generate practice quiz:', error);
                                   this._hideLoading();
                                   this._showError(`Error generating practice quiz: ${error.message}`);
                            });
              }
       }
}

// Make the class available globally
if (typeof window !== 'undefined') {
       window.AiTutorDialog = AiTutorDialog;
}

// Export for module systems
if (typeof module !== 'undefined') {
       module.exports = { AiTutorDialog };
} 