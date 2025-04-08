/**
 * French Grammar Quiz - AI Quiz Generator Module
 * Handles integration with Google Gemini AI to generate personalized quizzes
 */

class AiQuizGenerator {
       constructor() {
              this.apiKey = null; // Will be set via setApiKey method
              this.geminiModel = null;
              this.selectedModelName = 'gemini-1.5-flash'; // Default model
              this.isInitialized = false;
              this.userProfile = {
                     strengths: [],
                     weaknesses: [],
                     proficiencyLevel: 'beginner', // beginner, intermediate, advanced
                     learningHistory: []
              };
              this.activeCategoryId = null; // Track the currently active category
              this.tutorChatHistory = []; // Store chat history with tutor
       }

       /**
        * Initialize the AI quiz generator with API key and model name
        * @param {string} apiKey - Google Gemini API key
        * @param {string} modelName - Name of the Gemini model to use (e.g., 'gemini-1.5-flash')
        */
       async initialize(apiKey, modelName = 'gemini-1.5-flash') {
              if (!apiKey) {
                     throw new Error('API key is required to initialize AI Quiz Generator');
              }

              this.apiKey = apiKey;
              this.selectedModelName = modelName; // Store the selected model name

              try {
                     // Check if the Google Generative AI library is available
                     if (typeof window.GoogleGenerativeAI === 'undefined') {
                            console.error('Google Generative AI library not found');
                            throw new Error('Google Generative AI library is not available. Please make sure it is loaded properly.');
                     }

                     // Initialize the Gemini API client
                     const GoogleGenerativeAI = window.GoogleGenerativeAI;
                     let safetySettings = [];

                     // Add safety settings if HarmCategory is available
                     if (window.HarmCategory && window.HarmBlockThreshold) {
                            const { HarmCategory, HarmBlockThreshold } = window;
                            safetySettings = [
                                   { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                                   { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                                   { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                                   { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                            ];
                     }

                     const genAI = new GoogleGenerativeAI(this.apiKey);
                     console.log('Created GoogleGenerativeAI instance');

                     // Get the specified model with safety settings if available
                     const modelConfig = { model: this.selectedModelName };
                     if (safetySettings.length > 0) {
                            modelConfig.safetySettings = safetySettings;
                     }

                     this.geminiModel = genAI.getGenerativeModel(modelConfig);
                     console.log(`Obtained Gemini model: ${this.selectedModelName}`);

                     // Test that the API key works with a simple generation
                     try {
                            const testResult = await this.geminiModel.generateContent('Say "Hello" if this test was successful.');
                            const testResponse = testResult.response || testResult;
                            const testText = typeof testResponse.text === 'function' ? testResponse.text() : testResponse.text;
                            console.log('Test response from Gemini:', testText);
                     } catch (testError) {
                            console.error('API test failed:', testError);
                            throw new Error(`API key validation failed: ${testError.message}`);
                     }

                     this.isInitialized = true;
                     console.log('AI Quiz Generator initialized successfully');
                     return true;
              } catch (error) {
                     console.error('Failed to initialize AI Quiz Generator:', error);
                     throw new Error(`AI initialization failed: ${error.message}`);
              }
       }

       /**
        * Update user profile with strengths and weaknesses
        * @param {Object} profileData - User profile data
        */
       updateUserProfile(profileData) {
              if (profileData.strengths) this.userProfile.strengths = profileData.strengths;
              if (profileData.weaknesses) this.userProfile.weaknesses = profileData.weaknesses;
              if (profileData.proficiencyLevel) this.userProfile.proficiencyLevel = profileData.proficiencyLevel;

              // Add quiz results to learning history
              if (profileData.quizResults) {
                     this.userProfile.learningHistory.push({
                            timestamp: new Date().toISOString(),
                            results: profileData.quizResults
                     });
              }

              console.log('User profile updated:', this.userProfile);
       }

       /**
        * Initialize the AI tutor for a specific category
        * @param {string} categoryId - The category to initialize the tutor for
        */
       async initializeTutorForCategory(categoryId) {
              if (!this.isInitialized) {
                     throw new Error('AI Quiz Generator is not initialized. Call initialize() first.');
              }

              this.activeCategoryId = categoryId;

              // Reset chat history with a system prompt
              const systemPrompt = this._createTutorSystemPrompt(categoryId);

              this.tutorChatHistory = [
                     { role: 'system', content: systemPrompt }
              ];

              console.log('AI Tutor initialized for category:', categoryId);
              return true;
       }

       /**
        * Create a system prompt for the AI tutor based on the category
        * @param {string} categoryId - The category ID
        * @returns {string} - Formatted system prompt
        * @private
        */
       _createTutorSystemPrompt(categoryId) {
              const { proficiencyLevel, strengths = [], weaknesses = [] } = this.userProfile;
              const categoryTitle = this._formatCategoryTitle(categoryId);
              const categoryDescription = this._getCategoryDescription(categoryId);

              return `You are a helpful and patient French language tutor specialized in ${categoryTitle}.
              
Category: ${categoryTitle}
Focus Area: ${categoryDescription}
Student Proficiency: ${proficiencyLevel}
${strengths.length > 0 ? `Student Strengths: ${strengths.join(', ')}` : ''}
${weaknesses.length > 0 ? `Areas to Improve: ${weaknesses.join(', ')}` : ''}

Important guidelines for your responses:
1. Explain in simple, clear language appropriate for a ${proficiencyLevel} French student
2. Break down complex problems into easily understandable steps
3. Help with hints rather than immediately giving complete solutions
4. Be encouraging and patient
5. Use visual explanations when possible (with text characters)
6. Go through concepts fundamentally
7. Ask occasionally if the student can follow your explanation
8. Always write French words/phrases in bold or italic to highlight them

Your goal is to help the student improve their French grammar skills specifically related to ${categoryTitle}.`;
       }

       /**
        * Get description for a specific category
        * @param {string} categoryId - Category ID
        * @returns {string} - Category description
        * @private
        */
       _getCategoryDescription(categoryId) {
              const descriptions = {
                     'telling-time': 'expressing time in French including hours, minutes, and time-related expressions',
                     'writing-practice': 'French sentence structure, verb placement, and proper written expression',
                     'matching-articles': 'correctly using French articles (le, la, les, un, une, des) with nouns',
                     'subject-verb': 'French verb conjugation and ensuring subject-verb agreement',
                     'free-writing': 'composing coherent paragraphs and texts in French with proper grammar'
              };

              return descriptions[categoryId] || 'general French grammar concepts';
       }

       /**
        * Send a message to the AI tutor and get a response
        * @param {string} message - The user's message
        * @returns {Promise<Object>} - The AI tutor's response
        */
       async sendMessageToTutor(message) {
              if (!this.isInitialized) {
                     throw new Error('AI Quiz Generator is not initialized. Call initialize() first.');
              }

              if (!this.activeCategoryId) {
                     throw new Error('AI Tutor is not initialized for any category. Call initializeTutorForCategory() first.');
              }

              try {
                     // Add the user message to the chat history
                     this.tutorChatHistory.push({
                            role: 'user',
                            content: message
                     });

                     // Generate content using Gemini
                     const result = await this.geminiModel.generateContent({
                            contents: this.tutorChatHistory,
                            generationConfig: {
                                   temperature: 0.7,
                                   maxOutputTokens: 800
                            }
                     });

                     const response = result.response;
                     const text = response.text();

                     // Add AI response to chat history
                     this.tutorChatHistory.push({
                            role: 'assistant',
                            content: text
                     });

                     return {
                            role: 'assistant',
                            content: text
                     };
              } catch (error) {
                     console.error('Failed to get tutor response:', error);
                     throw new Error('Failed to get response from AI Tutor. Please try again.');
              }
       }

       /**
        * Analyze a user's answer to a quiz question
        * @param {string} userAnswer - The user's answer
        * @param {string} correctAnswer - The correct answer
        * @param {string} questionText - The question text
        * @returns {Promise<Object>} - Analysis of the answer
        */
       async analyzeAnswer(userAnswer, correctAnswer, questionText) {
              if (!this.isInitialized) {
                     throw new Error('AI Quiz Generator is not initialized. Call initialize() first.');
              }

              const attemptHistory = this.userProfile.learningHistory.length;

              const analysisPrompt = `
Question: ${questionText}
Student's answer: ${userAnswer}
Correct answer: ${correctAnswer}
Number of previous attempts: ${attemptHistory}

Please analyze the student's answer and provide helpful guidance. Focus on:
1. What they did correctly
2. Where they made mistakes
3. Why the correct answer is what it is
4. A helpful tip to remember this grammar rule
`;

              try {
                     const result = await this.geminiModel.generateContent(analysisPrompt);
                     const response = result.response;
                     return {
                            role: 'assistant',
                            content: response.text()
                     };
              } catch (error) {
                     console.error('Failed to analyze answer:', error);
                     throw new Error('Failed to analyze answer. Please try again.');
              }
       }

       /**
        * Generate a personalized quiz based on user profile
        * @param {string} category - The category to generate questions for
        * @param {number} questionCount - Number of questions to generate
        * @returns {Promise<Object>} - Generated quiz data
        */
       async generateQuiz(category, questionCount = 5) {
              if (!this.isInitialized) {
                     throw new Error('AI Quiz Generator is not initialized. Call initialize() first.');
              }

              // Save active category
              this.activeCategoryId = category;

              // Default to 5 questions if not specified or invalid
              questionCount = Number(questionCount) || 5;

              // Prepare the prompt for Gemini
              const prompt = this._buildPrompt(category, questionCount);

              try {
                     // Generate content using Gemini
                     const result = await this.geminiModel.generateContent(prompt);
                     const response = result.response;
                     const text = response.text();

                     // Parse the generated content into quiz format
                     const parsedQuiz = this._parseGeneratedContent(text, category);
                     return parsedQuiz;
              } catch (error) {
                     console.error('Failed to generate quiz with AI:', error);
                     throw new Error('Failed to generate quiz. Please try again later.');
              }
       }

       /**
        * Build a prompt for Gemini based on user profile and requested category
        * @private
        * @param {string} category - The category to generate questions for
        * @param {number} questionCount - Number of questions to generate
        * @returns {string} - Formatted prompt
        */
       _buildPrompt(category, questionCount) {
              const { strengths, weaknesses, proficiencyLevel } = this.userProfile;

              let categoryDescription;
              switch (category) {
                     case 'telling-time':
                            categoryDescription = 'telling time in French (using hours, minutes, expressions like "quarter to", "half past", etc.)';
                            break;
                     case 'writing-practice':
                            categoryDescription = 'French writing practice focusing on sentence structure and vocabulary';
                            break;
                     case 'matching-articles':
                            categoryDescription = 'matching correct articles (le, la, les, un, une, des) with French nouns';
                            break;
                     case 'subject-verb':
                            categoryDescription = 'French subject-verb agreement and conjugation';
                            break;
                     case 'free-writing':
                            categoryDescription = 'French writing prompts for paragraph composition';
                            break;
                     default:
                            categoryDescription = 'general French grammar concepts';
              }

              return `
        Generate a French grammar quiz with ${questionCount} questions focused on ${categoryDescription}.
        
        The student's proficiency level is: ${proficiencyLevel}
        Strengths: ${strengths.join(', ') || 'Not specified'}
        Areas to improve: ${weaknesses.join(', ') || 'Not specified'}
        
        For each question, please follow this exact JSON format:
        {
            "questions": [
                {
                    "id": "generated-1",
                    "type": "multiple-choice",
                    "text": "What is the correct way to say...",
                    "options": [
                        {"id": "a", "text": "Option A"},
                        {"id": "b", "text": "Option B"},
                        {"id": "c", "text": "Option C"},
                        {"id": "d", "text": "Option D"}
                    ],
                    "correctAnswers": ["c"],
                    "explanation": "Explanation of the correct answer..."
                },
                {
                    "id": "generated-2",
                    "type": "fill-in-blank",
                    "text": "Complete the sentence: J'ai ________ chien et ________ chat.",
                    "blanks": [
                        {"id": "blank1", "answer": "un"},
                        {"id": "blank2", "answer": "un"}
                    ],
                    "explanation": "The correct answers are 'un' and 'un' because..."
                }
            ]
        }
        
        Important:
        - Question types should be one of: multiple-choice, fill-in-blank, text-input, or matching
        - For multiple-choice, you can have single or multiple correct answers
        - For fill-in-blank, make sure to use exactly "________" (8 underscores) as the placeholder in the text
        - Ensure all explanations provide educational value
        - Make sure the JSON is valid and properly formatted
        
        Only return the JSON, no other text.
        `;
       }

       /**
        * Parse the generated content into a structured quiz object
        * @private
        * @param {string} content - Raw generated content from AI
        * @param {string} category - The category of the quiz
        * @returns {Object} - Structured quiz data
        */
       _parseGeneratedContent(content, category) {
              try {
                     // Try to extract JSON from the response
                     const jsonRegex = /{[\s\S]*}/;
                     const match = content.match(jsonRegex);

                     if (!match) {
                            throw new Error('No valid JSON found in AI response');
                     }

                     const jsonStr = match[0];
                     const parsedData = JSON.parse(jsonStr);

                     // Check if the expected structure is there
                     if (!parsedData.questions || !Array.isArray(parsedData.questions)) {
                            throw new Error('AI response does not contain questions array');
                     }

                     // Create a properly formatted quiz object
                     const quizData = {
                            id: `ai-generated-${category}`,
                            title: `AI Generated ${this._formatCategoryTitle(category)} Quiz`,
                            description: `A personalized quiz focused on ${this._formatCategoryTitle(category).toLowerCase()}, tailored to your learning needs.`,
                            icon: this._getCategoryIcon(category),
                            questions: parsedData.questions
                     };

                     return quizData;
              } catch (error) {
                     console.error('Failed to parse AI-generated content:', error);
                     throw new Error('Failed to parse AI response. Please try again.');
              }
       }

       /**
        * Format a category ID into a readable title
        * @private
        * @param {string} category - Category ID
        * @returns {string} - Formatted title
        */
       _formatCategoryTitle(category) {
              const categoryMap = {
                     'telling-time': 'Telling Time',
                     'writing-practice': 'Writing Practice',
                     'matching-articles': 'Article Matching',
                     'subject-verb': 'Subject-Verb Agreement',
                     'free-writing': 'Free Writing'
              };

              return categoryMap[category] || category.split('-')
                     .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                     .join(' ');
       }

       /**
        * Get an appropriate icon for a category
        * @private
        * @param {string} category - Category ID
        * @returns {string} - Icon emoji
        */
       _getCategoryIcon(category) {
              const iconMap = {
                     'telling-time': '🕒',
                     'writing-practice': '✍️',
                     'matching-articles': '🔤',
                     'subject-verb': '📝',
                     'free-writing': '📄'
              };

              return iconMap[category] || '🤖';
       }
}

// Make the AI quiz generator available globally
if (typeof window !== 'undefined') {
       window.AiQuizGenerator = AiQuizGenerator;
}

// Export for module systems
if (typeof module !== 'undefined') {
       module.exports = { AiQuizGenerator };
} 