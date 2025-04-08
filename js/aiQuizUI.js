/**
 * French Grammar Quiz - AI Quiz UI Component
 * Handles the UI for generating personalized quizzes with Google Gemini AI
 */

class AiQuizUI {
       constructor(aiQuizGenerator, quizManager, quizRenderer) {
              this.aiQuizGenerator = aiQuizGenerator;
              this.quizManager = quizManager;
              this.quizRenderer = quizRenderer;
              this.isInitialized = false;
              this.apiKeyConfigured = false;
       }

       /**
        * Initialize the AI Quiz UI component
        */
       initialize() {
              console.log('Initializing AI Quiz UI component');

              // Create and add the AI quiz generator UI to the page
              this._createUI();

              // Add event listeners
              this._setupEventListeners();

              // Make the AI section more visible
              this._highlightAiSection();

              this.isInitialized = true;
              console.log('AI Quiz UI initialized');
       }

       /**
        * Create the AI Quiz UI elements
        * @private
        */
       _createUI() {
              // Create the AI Quiz section to be added before the category listing
              const aiSection = document.createElement('section');
              aiSection.id = 'ai-quiz-section';
              aiSection.className = 'mb-8 bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto';

              aiSection.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold flex items-center">
                    <span class="mr-2">🤖</span> AI-Powered Personalized Quiz
                </h2>
                <button id="ai-settings-toggle" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <!-- Large, prominent API key setup notice for first-time users -->
            <div id="api-key-setup-notice" class="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-yellow-800">API Key Required</h3>
                        <div class="mt-2 text-sm text-yellow-700">
                            <p>You need a Google Gemini API key to use this feature.</p>
                            <button id="setup-api-key-btn" class="mt-3 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md transition-colors inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                Set Up API Key Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Settings panel -->
            <div id="ai-settings-panel" class="mb-6 p-4 bg-gray-50 rounded-md">
                <div class="mb-4">
                    <label for="api-key" class="block text-sm font-medium text-gray-700 mb-1">Google Gemini API Key</label>
                    <div class="flex">
                        <input type="password" id="api-key" placeholder="Enter your Gemini API key" 
                            class="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <button id="save-api-key" class="ml-2 px-3 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors">
                            Save
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">Get your API key from <a href="https://ai.google.dev/" target="_blank" class="text-primary">Google AI Studio</a></p>
                </div>
                
                <div class="mb-4">
                    <label for="ai-model-select" class="block text-sm font-medium text-gray-700 mb-1">Select AI Model</label>
                    <select id="ai-model-select" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fastest)</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro (Latest Pro)</option>
                        <option value="gemini-pro">Gemini Pro (Text Only)</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">Select the Gemini model to use for generation. Flash is faster, Pro is more capable.</p>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Proficiency Level</label>
                    <select id="proficiency-level" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Your Strengths</label>
                        <div id="strengths-container" class="space-y-2">
                            <div class="flex items-center">
                                <input type="text" class="strength-input flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Verb conjugation">
                                <button class="add-strength-btn ml-2 p-1 text-primary hover:text-blue-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Areas to Improve</label>
                        <div id="weaknesses-container" class="space-y-2">
                            <div class="flex items-center">
                                <input type="text" class="weakness-input flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Articles with nouns">
                                <button class="add-weakness-btn ml-2 p-1 text-primary hover:text-blue-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mb-4">
                <label for="ai-quiz-category" class="block text-sm font-medium text-gray-700 mb-2">Choose a Category</label>
                <select id="ai-quiz-category" class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="telling-time">Telling Time</option>
                    <option value="writing-practice">Writing Practice</option>
                    <option value="matching-articles">Article Matching</option>
                    <option value="subject-verb">Subject-Verb Agreement</option>
                    <option value="free-writing">Free Writing</option>
                </select>
            </div>
            
            <div class="mb-6">
                <label for="question-count" class="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                <input type="range" id="question-count" min="3" max="10" value="5" 
                    class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                <div class="flex justify-between text-xs text-gray-500 px-1">
                    <span>3</span>
                    <span id="question-count-display">5</span>
                    <span>10</span>
                </div>
            </div>
            
            <div class="flex justify-center">
                <button id="generate-quiz-btn" class="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-md font-medium hover:opacity-90 transition-opacity flex items-center" disabled>
                    <span class="mr-2">Generate Personalized Quiz</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            
            <div id="generation-status" class="mt-4 text-center hidden">
                <div class="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                <span class="ml-2">Generating your personalized quiz...</span>
            </div>
        `;

              // Add the AI section before the category selection section
              const categorySection = document.getElementById('category-selection');
              if (categorySection) {
                     categorySection.parentNode.insertBefore(aiSection, categorySection);
              }
       }

       /**
        * Set up event listeners for the AI Quiz UI
        * @private
        */
       _setupEventListeners() {
              // Settings toggle
              const settingsToggle = document.getElementById('ai-settings-toggle');
              const settingsPanel = document.getElementById('ai-settings-panel');

              if (settingsToggle && settingsPanel) {
                     settingsToggle.addEventListener('click', () => {
                            settingsPanel.classList.toggle('hidden');
                            console.log('Settings panel visibility toggled');
                     });
              }

              // Setup API key button
              const setupApiKeyBtn = document.getElementById('setup-api-key-btn');
              if (setupApiKeyBtn) {
                     setupApiKeyBtn.addEventListener('click', () => {
                            // Make sure the settings panel is visible
                            const settingsPanel = document.getElementById('ai-settings-panel');
                            if (settingsPanel && settingsPanel.classList.contains('hidden')) {
                                   settingsPanel.classList.remove('hidden');
                            }

                            // Focus on the API key input
                            const apiKeyInput = document.getElementById('api-key');
                            if (apiKeyInput) {
                                   apiKeyInput.focus();
                            }
                     });
              }

              // Save API key
              const saveApiKeyBtn = document.getElementById('save-api-key');
              if (saveApiKeyBtn) {
                     saveApiKeyBtn.addEventListener('click', this._handleSaveApiKey.bind(this));
              }

              // Question count slider
              const questionCountSlider = document.getElementById('question-count');
              const questionCountDisplay = document.getElementById('question-count-display');
              if (questionCountSlider && questionCountDisplay) {
                     questionCountSlider.addEventListener('input', () => {
                            questionCountDisplay.textContent = questionCountSlider.value;
                     });
              }

              // Add strength button
              document.addEventListener('click', (e) => {
                     if (e.target.closest('.add-strength-btn')) {
                            this._addInputField('strengths-container', 'strength-input');
                     }
              });

              // Add weakness button
              document.addEventListener('click', (e) => {
                     if (e.target.closest('.add-weakness-btn')) {
                            this._addInputField('weaknesses-container', 'weakness-input');
                     }
              });

              // Generate quiz button
              const generateQuizBtn = document.getElementById('generate-quiz-btn');
              if (generateQuizBtn) {
                     generateQuizBtn.addEventListener('click', this._handleGenerateQuiz.bind(this));
              }

              // Load saved API key and model from localStorage
              this._loadSavedApiKey();
       }

       /**
        * Load saved API key and model from localStorage
        * @private
        */
       _loadSavedApiKey() {
              const savedApiKey = localStorage.getItem('gemini-api-key');
              const savedModel = localStorage.getItem('gemini-model') || 'gemini-1.5-flash';

              // Set the model dropdown
              const modelSelect = document.getElementById('ai-model-select');
              if (modelSelect) {
                     modelSelect.value = savedModel;
              }

              if (savedApiKey) {
                     document.getElementById('api-key').value = savedApiKey;

                     // Try to initialize with the saved key and model
                     this._initializeWithKey();

                     // Hide the API key setup notice since we have a key
                     const apiKeySetupNotice = document.getElementById('api-key-setup-notice');
                     if (apiKeySetupNotice) {
                            apiKeySetupNotice.style.display = 'none';
                     }
              }
       }

       /**
        * Initialize the AI quiz generator with an API key
        * @private
        */
       _initializeWithKey() {
              const savedApiKey = localStorage.getItem('gemini-api-key');
              const savedModel = localStorage.getItem('gemini-model') || 'gemini-1.5-flash';

              if (!savedApiKey) {
                     console.log('No API key found in local storage');
                     // Don't show error here, will be handled when user tries to use AI features
                     return false;
              }

              try {
                     console.log(`Initializing AI with saved key and model: ${savedModel}`);
                     this.aiQuizGenerator.initialize(savedApiKey, savedModel)
                            .then(() => {
                                   console.log('AI initialized with saved key');
                                   // Update the UI to show that AI is ready
                                   this._updateAiStatusUI(true);
                            })
                            .catch(error => {
                                   console.error('Failed to initialize with saved key:', error);
                                   // Update UI to show AI initialization failed
                                   this._updateAiStatusUI(false, error.message);
                            });

                     return true;
              } catch (error) {
                     console.error('Error during initialization:', error);
                     return false;
              }
       }

       /**
        * Updates the UI to reflect AI status
        * @param {boolean} isReady - Whether the AI is initialized and ready
        * @param {string} errorMessage - Error message if there was a problem
        * @private
        */
       _updateAiStatusUI(isReady, errorMessage = '') {
              const statusElement = document.getElementById('ai-status');
              if (!statusElement) return;

              if (isReady) {
                     statusElement.textContent = 'AI Ready';
                     statusElement.className = 'status-pill success';
              } else {
                     statusElement.textContent = 'AI Inactive';
                     statusElement.className = 'status-pill error';
                     statusElement.title = errorMessage || 'AI not initialized';
              }
       }

       /**
        * Handle saving the API key and model
        * @private
        */
       async _handleSaveApiKey() {
              const apiKeyInput = document.getElementById('api-key');
              const modelSelect = document.getElementById('ai-model-select');
              const apiKeyStatus = document.getElementById('api-key-status');

              if (!apiKeyInput || !modelSelect) {
                     console.error('Required elements not found');
                     return;
              }

              const apiKey = apiKeyInput.value.trim();
              const modelName = modelSelect.value;

              if (!apiKey) {
                     if (apiKeyStatus) {
                            apiKeyStatus.textContent = 'Please enter an API key';
                            apiKeyStatus.className = 'status-message error';
                     } else {
                            this._showError('Please enter a valid API key');
                     }
                     return;
              }

              // Save to localStorage
              localStorage.setItem('gemini-api-key', apiKey);
              localStorage.setItem('gemini-model', modelName);

              // Update UI status if element exists
              if (apiKeyStatus) {
                     apiKeyStatus.textContent = 'Validating API key...';
                     apiKeyStatus.className = 'status-message info';
              }

              try {
                     // Initialize AI generator with new key
                     await this.aiQuizGenerator.initialize(apiKey, modelName);

                     // Show success message
                     if (apiKeyStatus) {
                            apiKeyStatus.textContent = 'API key saved and validated successfully!';
                            apiKeyStatus.className = 'status-message success';
                     }

                     // Hide API key setup notice
                     const apiKeySetupNotice = document.getElementById('api-key-setup-notice');
                     if (apiKeySetupNotice) {
                            apiKeySetupNotice.classList.add('hidden');
                     }

                     // Update the AI status element if it exists
                     const aiStatusElement = document.getElementById('ai-status');
                     if (aiStatusElement) {
                            aiStatusElement.textContent = 'AI Ready';
                            aiStatusElement.className = 'status-pill success';
                     }

                     // Close settings panel after a delay
                     setTimeout(() => {
                            const settingsToggle = document.getElementById('ai-settings-toggle');
                            if (settingsToggle && !settingsToggle.checked) {
                                   settingsToggle.checked = false;

                                   const settingsPanel = document.getElementById('ai-settings-panel');
                                   if (settingsPanel && !settingsPanel.classList.contains('hidden')) {
                                          settingsPanel.classList.add('hidden');
                                   }
                            }
                     }, 2000);

              } catch (error) {
                     console.error('Failed to initialize AI:', error);

                     // Show error message
                     if (apiKeyStatus) {
                            apiKeyStatus.textContent = `Error: ${error.message}`;
                            apiKeyStatus.className = 'status-message error';
                     } else {
                            this._showError(`Failed to initialize AI: ${error.message}`);
                     }
              }
       }

       /**
        * Show an error message in the UI
        * @private
        * @param {string} message - The error message to display
        */
       _showError(message) {
              // Clear any existing errors first
              this._clearErrors();

              // Find the API key container
              const apiKeyContainer = document.querySelector('[for="api-key"]').parentNode;

              // Create error message element
              const errorElement = document.createElement('div');
              errorElement.className = 'api-error mt-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm animate-fadeIn';
              errorElement.innerHTML = `< p class="flex items-center" > <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg> ${message}</p > `;

              // Add to the container
              apiKeyContainer.appendChild(errorElement);
       }

       /**
        * Clear any error messages in the UI
        * @private
        */
       _clearErrors() {
              const errors = document.querySelectorAll('.api-error');
              errors.forEach(error => error.remove());
       }

       /**
        * Add a new input field for strengths or weaknesses
        * @private
        * @param {string} containerId - ID of the container element
        * @param {string} inputClass - Class name for the input element
        */
       _addInputField(containerId, inputClass) {
              const container = document.getElementById(containerId);
              if (!container) return;

              const newInputWrapper = document.createElement('div');
              newInputWrapper.className = 'flex items-center';

              newInputWrapper.innerHTML = `
       < input type = "text" class="${inputClass} flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" placeholder = "Add another..." >
              <button class="remove-btn ml-2 p-1 text-red-500 hover:text-red-700">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                     </svg>
              </button>
`;

              // Add remove button functionality
              const removeBtn = newInputWrapper.querySelector('.remove-btn');
              removeBtn.addEventListener('click', () => {
                     container.removeChild(newInputWrapper);
              });

              container.appendChild(newInputWrapper);
       }

       /**
        * Update user profile from UI inputs
        * @private
        */
       _updateUserProfile() {
              // Get proficiency level
              const proficiencyLevel = document.getElementById('proficiency-level').value;

              // Get strengths
              const strengthInputs = document.querySelectorAll('.strength-input');
              const strengths = Array.from(strengthInputs)
                     .map(input => input.value.trim())
                     .filter(value => value !== '');

              // Get weaknesses
              const weaknessInputs = document.querySelectorAll('.weakness-input');
              const weaknesses = Array.from(weaknessInputs)
                     .map(input => input.value.trim())
                     .filter(value => value !== '');

              // Update the profile
              this.aiQuizGenerator.updateUserProfile({
                     proficiencyLevel,
                     strengths,
                     weaknesses
              });
       }

       /**
        * Handle generating a quiz
        * @private
        */
       async _handleGenerateQuiz() {
              // Check if AI generator is initialized
              if (!this.aiQuizGenerator.isInitialized) {
                     console.log('AI not initialized, checking for saved API key');

                     // Check if there's a saved API key
                     const savedApiKey = localStorage.getItem('gemini-api-key');
                     const savedModel = localStorage.getItem('gemini-model');

                     if (savedApiKey) {
                            // Try to initialize with saved key
                            try {
                                   await this.aiQuizGenerator.initialize(savedApiKey, savedModel);
                            } catch (error) {
                                   console.error('Failed to initialize with saved key:', error);
                                   // Show API key dialog
                                   this._promptForApiKey();
                                   return;
                            }
                     } else {
                            // No saved key, show API key dialog
                            this._promptForApiKey();
                            return;
                     }
              }

              // Get the selected category
              const categorySelect = document.getElementById('ai-quiz-category');
              if (!categorySelect) {
                     console.error('Category select element not found');
                     return;
              }

              const selectedCategory = categorySelect.value;
              if (!selectedCategory) {
                     alert('Please select a category');
                     return;
              }

              // Get the number of questions
              const questionCountInput = document.getElementById('question-count');
              const questionCount = parseInt(questionCountInput?.value || '5', 10);

              if (isNaN(questionCount) || questionCount < 1) {
                     alert('Please enter a valid number of questions');
                     return;
              }

              // Show loading state
              this._setGeneratingState(true);

              try {
                     // Update user profile with latest data
                     const userProfile = this._getUserProfile();
                     this.aiQuizGenerator.updateUserProfile(userProfile);

                     // Generate the quiz
                     console.log(`Generating quiz for category: ${selectedCategory} with ${questionCount} questions`);
                     const quiz = await this.aiQuizGenerator.generateQuiz(selectedCategory, questionCount);

                     // Start the quiz with the generated questions
                     this._startGeneratedQuiz(quiz);
              } catch (error) {
                     console.error('Failed to generate quiz:', error);
                     this._showError(`Failed to generate quiz: ${error.message}`);
              } finally {
                     this._setGeneratingState(false);
              }
       }

       /**
        * Prompt user for API key
        * @private
        */
       _promptForApiKey() {
              console.log('Prompting for API key');

              // Check if AiTutorDialog exists and use it
              if (typeof window.aiTutorDialog !== 'undefined') {
                     window.aiTutorDialog._showAiTutorDialog();
                     return;
              }

              // Fallback to showing the settings panel
              const settingsPanel = document.getElementById('ai-settings-panel');
              if (settingsPanel) {
                     if (settingsPanel.classList.contains('hidden')) {
                            settingsPanel.classList.remove('hidden');
                     }

                     // Add highlighting effect to draw attention
                     settingsPanel.classList.add('highlight-panel');
                     setTimeout(() => {
                            settingsPanel.classList.remove('highlight-panel');
                     }, 2000);

                     // Show a message
                     this._showError('Please set up your Google Gemini API key in the settings panel to use AI features.');
              } else {
                     // Fallback to basic alert if panel doesn't exist
                     alert('Please set up your Google Gemini API key to use AI features.');
              }
       }

       /**
        * Highlight the AI section to make it more noticeable
        * @private
        */
       _highlightAiSection() {
              const aiSection = document.getElementById('ai-quiz-section');
              if (aiSection) {
                     // Add a subtle border to draw attention initially
                     aiSection.classList.add('border-2', 'border-accent');

                     // Remove the border after a few seconds
                     setTimeout(() => {
                            aiSection.classList.remove('border-2', 'border-accent');
                     }, 3000);

                     // If API key isn't set, show the helper message
                     const apiKey = localStorage.getItem('gemini_api_key');
                     if (!apiKey) {
                            const settingsPanel = document.getElementById('ai-settings-panel');
                            if (settingsPanel) {
                                   // settingsPanel.classList.remove('hidden'); // Panel is already visible

                                   // Add a helper message if not already present
                                   if (!settingsPanel.querySelector('.api-setup-helper')) {
                                          const helperMsg = document.createElement('div');
                                          helperMsg.className = 'api-setup-helper mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700';
                                          helperMsg.innerHTML = `
       < p class="font-semibold" > To use AI features, you need a Google Gemini API key:</p >
              <ol class="list-decimal ml-5 mt-2 space-y-1">
                     <li>Go to <a href="https://ai.google.dev/" target="_blank" class="text-primary underline">Google AI Studio</a></li>
                     <li>Sign in and create an API key</li>
                     <li>Paste your key in the field above and click Save</li>
              </ol>
`;

                                          // Insert after the API key input
                                          const apiKeyContainer = document.querySelector('[for="api-key"]').parentNode;
                                          apiKeyContainer.appendChild(helperMsg);
                                   }
                            }
                     }
              }
       }

       /**
        * Start a quiz with generated questions
        * @param {Object} quiz - The generated quiz object
        * @private
        */
       _startGeneratedQuiz(quiz) {
              console.log('Starting generated quiz:', quiz);

              // Store the generated quiz in the global quiz data if it exists
              if (window.quizData) {
                     // Generate a unique ID for the quiz if it doesn't have one
                     if (!quiz.id) {
                            quiz.id = `ai-generated-${Date.now()}`;
                     }

                     // Add the quiz to the quiz data
                     window.quizData[quiz.id] = quiz;
                     console.log('Added generated quiz to quizData:', window.quizData[quiz.id]);

                     // Start the quiz using the quiz renderer
                     if (this.quizRenderer) {
                            this.quizRenderer.startQuiz(quiz.id);
                     } else if (window.quizRenderer) {
                            window.quizRenderer.startQuiz(quiz.id);
                     } else {
                            this._showError('Quiz renderer not found. Cannot start the quiz.');
                     }
              } else {
                     this._showError('Quiz data not found. Cannot start the quiz.');
              }
       }

       /**
        * Set the generating state (loading/UI feedback)
        * @param {boolean} isGenerating - Whether a quiz is being generated
        * @private
        */
       _setGeneratingState(isGenerating) {
              // Update the generate button state
              const generateButton = document.getElementById('generate-quiz-btn');
              if (generateButton) {
                     generateButton.disabled = isGenerating;
                     generateButton.innerHTML = isGenerating
                            ? '<span class="spinner"></span> Generating...'
                            : 'Generate Quiz';
              }

              // Show/hide the generation status
              const generationStatus = document.getElementById('generation-status');
              if (generationStatus) {
                     if (isGenerating) {
                            generationStatus.classList.remove('hidden');
                     } else {
                            generationStatus.classList.add('hidden');
                     }
              }

              // Disable/enable other form elements during generation
              const formElements = document.querySelectorAll('#ai-quiz-form select, #ai-quiz-form input');
              formElements.forEach(element => {
                     element.disabled = isGenerating;
              });
       }
}

// Export for module systems
if (typeof module !== 'undefined') {
       module.exports = { AiQuizUI };
} 