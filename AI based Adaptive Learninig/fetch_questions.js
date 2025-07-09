// fetch_questions.js
// Fetches new questions from Gemini API and shows a popup

// Replace with your API key
const API_KEY = "Put your own api";  // Make sure to use your actual API key here

document.addEventListener("DOMContentLoaded", function() {
  // Create popup element if it doesn't exist
  if (!document.getElementById("popup")) {
    const popup = document.createElement("div");
    popup.id = "popup";
    popup.style.display = "none";
    popup.style.position = "fixed";
    popup.style.top = "20px";
    popup.style.right = "20px";
    popup.style.backgroundColor = "#333";
    popup.style.color = "white";
    popup.style.padding = "15px";
    popup.style.borderRadius = "5px";
    popup.style.zIndex = "1000";
    document.body.appendChild(popup);
  }
  
  // Add a new button for generating questions with Gemini API
  const quizTypeSelection = document.getElementById("quiz-type-selection");
  if (quizTypeSelection) {
    const quizTypes = quizTypeSelection.querySelector(".quiz-types");
    
    const apiQuizCard = document.createElement("div");
    apiQuizCard.className = "quiz-type-card";
    apiQuizCard.innerHTML = `
      <i class="fas fa-robot"></i>
      <h3>AI-Generated Quiz</h3>
      <p>10 questions dynamically generated with AI</p>
      <div class="difficulty-selector">
        <select id="difficulty-select">
          <option value="easy">Easy</option>
          <option value="medium" selected>Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <button id="generate-quiz-btn" class="button">Generate Quiz</button>
    `;
    
    quizTypes.appendChild(apiQuizCard);
    
    // Add event listener for the new button
    document.getElementById("generate-quiz-btn").addEventListener("click", function() {
      const difficulty = document.getElementById("difficulty-select").value;
      fetchNewQuestions(difficulty);
    });
  }
});

// Helper function to show popup messages
function showPopup(message) {
    const popup = document.getElementById("popup");
    popup.innerText = message;
    popup.style.display = "block";
    setTimeout(() => { popup.style.display = "none"; }, 3000);
}

// Main function to fetch questions from Gemini API
async function fetchNewQuestions(difficulty) {
    showPopup("Generating new questions, please wait...");
    const prompt = `Generate 10 quiz questions on Theory of Computation with ${difficulty} difficulty. Each question should have 4 options (A, B, C, D) and indicate the correct answer. Format the response as valid JSON array with objects containing 'question', 'options' (as an array of strings), and 'correctAnswer' fields.`;
    
    try {
        // Try the latest Gemini API endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            })
        });
        
        if (!response.ok) {
            // If the first attempt fails, try the alternative endpoint
            console.log("First endpoint failed, trying alternative...");
            const alternativeResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048
                    }
                })
            });
            
            if (!alternativeResponse.ok) {
                console.error("API response status:", alternativeResponse.status);
                throw new Error(`API request failed with status ${alternativeResponse.status}`);
            }
            
            return processApiResponse(await alternativeResponse.json());
        }
        
        return processApiResponse(await response.json());
        
    } catch (error) {
        console.error("Error fetching new quiz questions:", error);
        showPopup("Failed to generate questions: " + error.message);
        // No fallback to pre-generated questions now
        return;
    }
}

// Process the API response and extract questions
function processApiResponse(data) {
    console.log("Full API response:", data);
    
    // Extract the response text from the Gemini API response
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        throw new Error("Invalid response format from API");
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    console.log("Raw response text:", responseText);
    
    try {
        // Look for JSON in the response
        // First approach: Try to parse the whole text as JSON
        let newQuestions;
        try {
            newQuestions = JSON.parse(responseText);
        } catch (e) {
            // Second approach: Try to find JSON array in the text
            const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
                newQuestions = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("Could not extract JSON from response");
            }
        }
        
        if (!Array.isArray(newQuestions) || newQuestions.length === 0) {
            throw new Error("Invalid questions format");
        }
        
        localStorage.setItem("adaptiveQuizQuestions", JSON.stringify(newQuestions));
        localStorage.setItem("newQuizReady", "true");
        showPopup("New questions generated! Starting quiz...");
        
        // Start the quiz with the generated questions
        startGeneratedQuiz();
    } catch (parseError) {
        console.error("Error parsing JSON from API response:", parseError);
        console.log("Raw output:", responseText);
        showPopup("Failed to parse questions format. Please try again.");
        return;
    }
}

// Function to start quiz with generated questions
function startGeneratedQuiz() {
    // Hide the quiz type selection
    document.getElementById("quiz-type-selection").style.display = "none";
    
    // Show the quiz container
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.style.display = "block";
    
    // Get the questions from localStorage
    const questions = JSON.parse(localStorage.getItem("adaptiveQuizQuestions"));
    
    // Call the initialization function from adaptive_quiz.js if it exists
    if (typeof initializeQuiz === "function") {
        initializeQuiz(questions, "AI-Generated Quiz");
    } else {
        // If there's no initialization function available, create a simple one
        console.log("Quiz initialization function not found, using basic initialization");
        basicInitializeQuiz(questions);
    }
}

// Basic quiz initialization if adaptive_quiz.js doesn't provide one
function basicInitializeQuiz(questions) {
    // Set quiz title
    document.getElementById("quiz-title").textContent = "AI-Generated Quiz";
    
    // Set total questions
    document.getElementById("total-questions").textContent = questions.length;
    
    // Initialize quiz state
    let currentQuestionIndex = 0;
    let score = 0;
    
    // Update score display
    document.getElementById("score-display").textContent = score;
    
    // Display first question
    displayQuestion(questions[currentQuestionIndex], currentQuestionIndex);
    
    // Add event listeners for answer buttons
    setupAnswerListeners(questions);
    
    // Set up next button
    document.getElementById("next-btn").addEventListener("click", function() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion(questions[currentQuestionIndex], currentQuestionIndex);
            document.getElementById("current-question").textContent = currentQuestionIndex + 1;
            updateProgressBar(currentQuestionIndex, questions.length);
        } else {
            showResults(score, questions.length);
        }
    });
}

// Helper function to display a question
function displayQuestion(question, index) {
    // Set question text
    document.getElementById("question-text").textContent = question.question;
    
    // Clear any previous feedback
    document.getElementById("feedback").textContent = "";
    document.getElementById("explanation").textContent = "";
    document.getElementById("feedback-container").style.display = "none";
    
    // Hide next button until answer is selected
    document.getElementById("next-container").style.display = "none";
    
    // Clear previous options
    const mcqOptions = document.getElementById("mcq-options");
    mcqOptions.innerHTML = "";
    
    // Check if we're dealing with true/false or MCQ
    if (question.options.length <= 2 && 
        question.options.every(option => 
            option.toLowerCase() === "true" || 
            option.toLowerCase() === "false")) {
        // Show true/false container, hide MCQ
        document.querySelector(".tf-container").style.display = "flex";
        mcqOptions.style.display = "none";
    } else {
        // Show MCQ, hide true/false
        document.querySelector(".tf-container").style.display = "none";
        mcqOptions.style.display = "flex";
        mcqOptions.style.flexDirection = "column";
        
        // Create option buttons
        question.options.forEach((option, i) => {
            const button = document.createElement("button");
            button.className = "button answer-btn";
            button.dataset.index = i;
            button.textContent = option;
            mcqOptions.appendChild(button);
        });
    }
    
    // Update current question number and progress bar
    document.getElementById("current-question").textContent = index + 1;
    updateProgressBar(index, 10); // Assuming 10 questions total
}

// Set up event listeners for answer buttons
function setupAnswerListeners(questions) {
    // True/False buttons
    document.getElementById("true-btn").addEventListener("click", function() {
        checkAnswer("True", questions);
    });
    
    document.getElementById("false-btn").addEventListener("click", function() {
        checkAnswer("False", questions);
    });
    
    // MCQ options - using event delegation
    document.getElementById("mcq-options").addEventListener("click", function(e) {
        if (e.target.classList.contains("answer-btn")) {
            const selectedOption = questions[getCurrentQuestionIndex()].options[e.target.dataset.index];
            checkAnswer(selectedOption, questions);
        }
    });
}

// Check if answer is correct
// Updated checkAnswer function with robust comparison
function checkAnswer(selectedAnswer, questions) {
    const currentQuestion = questions[getCurrentQuestionIndex()];
    
    // Normalize both answers for comparison
    const normalize = (str) => str.toString().trim().toLowerCase();
    const isCorrect = normalize(selectedAnswer) === normalize(currentQuestion.correctAnswer);
    
    // Show feedback
    const feedbackContainer = document.getElementById("feedback-container");
    const feedback = document.getElementById("feedback");
    
    feedbackContainer.style.display = "block";
    
    if (isCorrect) {
        feedback.textContent = "Correct!";
        feedback.style.color = "#4CAF50";
        // Update score
        const currentScore = parseInt(document.getElementById("score-display").textContent);
        document.getElementById("score-display").textContent = currentScore + 1;
    } else {
        feedback.textContent = `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`;
        feedback.style.color = "#F44336";
    }
    
    // Disable answer buttons
    document.querySelectorAll(".answer-btn").forEach(button => {
        button.disabled = true;
    });
    
    // Show next button
    document.getElementById("next-container").style.display = "block";
}

// Helper function to get current question index
function getCurrentQuestionIndex() {
    return parseInt(document.getElementById("current-question").textContent) - 1;
}

// Update progress bar
function updateProgressBar(currentIndex, total) {
    const progressPercentage = ((currentIndex + 1) / total) * 100;
    document.getElementById("progress-bar").style.width = `${progressPercentage}%`;
}

// Show quiz results
function showResults(score, total) {
    // Hide quiz container
    document.getElementById("quiz-container").style.display = "none";
    
    // Show results container
    const resultsContainer = document.getElementById("results-container");
    resultsContainer.style.display = "block";
    
    // Update score
    document.getElementById("final-score").textContent = score;
    document.getElementById("total-possible").textContent = total;
    
    // Set performance message
    const performanceMessage = document.getElementById("performance-message");
    const percentage = (score / total) * 100;
    
    if (percentage >= 90) {
        performanceMessage.textContent = "Excellent! You've mastered this topic!";
        performanceMessage.style.color = "#4CAF50";
    } else if (percentage >= 70) {
        performanceMessage.textContent = "Good job! You have a solid understanding.";
        performanceMessage.style.color = "#2196F3";
    } else if (percentage >= 50) {
        performanceMessage.textContent = "Not bad. Keep studying to improve!";
        performanceMessage.style.color = "#FF9800";
    } else {
        performanceMessage.textContent = "You need more practice with this topic.";
        performanceMessage.style.color = "#F44336";
    }
    
    // Set up retry button
    document.getElementById("retry-btn").addEventListener("click", function() {
        location.reload();
    });
    
    // Set up home button
    document.getElementById("home-btn").addEventListener("click", function() {
        window.location.href = "index.html";
    });
    
    // Simple chart for results
    createResultCharts(score, total);
}

// Enhanced Chart Visualization Functions
// Add this code to your fetch_questions.js file

// Create or ensure results graphs container exists
function setupResultsContainer() {
    if (!document.getElementById('results-graphs')) {
        const resultsGraphsContainer = document.createElement('div');
        resultsGraphsContainer.id = 'results-graphs';
        resultsGraphsContainer.className = 'results-graphs';
        
        // Create canvas elements for graphs
        const graphsHTML = `
            <div class="graph-row">
                <div class="graph-container">
                    <h3 class="graph-title">Performance by Question</h3>
                    <canvas id="performanceChart"></canvas>
                </div>
                <div class="graph-container">
                    <h3 class="graph-title">Score Distribution</h3>
                    <canvas id="scoreDistributionChart"></canvas>
                </div>
            </div>
            <div class="graph-row">
                <div class="graph-container">
                    <h3 class="graph-title">Time Analysis</h3>
                    <canvas id="timeAnalysisChart"></canvas>
                </div>
            </div>
            <div class="graph-row">
                <div class="graph-container">
                    <h3 class="graph-title">Correct vs Incorrect Comparison</h3>
                    <canvas id="comparisonChart"></canvas>
                </div>
                <div class="graph-container">
                    <h3 class="graph-title">Strengths & Weaknesses</h3>
                    <canvas id="strengthsWeaknessesChart"></canvas>
                </div>
            </div>
        `;
        
        resultsGraphsContainer.innerHTML = graphsHTML;
        
        // Insert into the results card
        const resultsCard = document.querySelector('.results-card');
        const buttonsContainer = document.querySelector('.buttons-container');
        if (resultsCard && buttonsContainer) {
            resultsCard.insertBefore(resultsGraphsContainer, buttonsContainer);
        } else {
            // If specific elements don't exist, append to the results-container
            document.getElementById('results-container').appendChild(resultsGraphsContainer);
        }
        
        // Add CSS for graphs
        const style = document.createElement('style');
        style.textContent = `
            .results-graphs {
                margin-top: 30px;
                width: 100%;
            }
            .graph-row {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-bottom: 20px;
            }
            .graph-container {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                flex: 1;
                min-width: 280px;
            }
            .graph-title {
                font-size: 16px;
                margin-bottom: 10px;
                color: #444;
                text-align: center;
            }
            canvas {
                width: 100% !important;
                height: 250px !important;
            }
            .analysis-container {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 15px;
                margin-top: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .analysis-container h3 {
                margin-top: 0;
                color: #333;
            }
            @media (max-width: 768px) {
                .graph-row {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Function to create performance chart with enhanced visuals
function createPerformanceChart(userAnswers) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    const questionNumbers = userAnswers.map(a => `Q${a.number}`);
    const correctData = userAnswers.map(a => a.isCorrect ? 1 : 0);
    const categories = userAnswers.map(a => a.category);
    
    // Create unique category colors map
    const categoryColors = {};
    const uniqueCategories = [...new Set(categories)];
    const colorPalette = [
        'rgba(75, 192, 192, 0.7)', 'rgba(54, 162, 235, 0.7)', 
        'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
        'rgba(255, 99, 132, 0.7)'
    ];
    
    uniqueCategories.forEach((category, index) => {
        categoryColors[category] = {
            correct: colorPalette[index % colorPalette.length],
            incorrect: 'rgba(255, 99, 132, 0.7)'
        };
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: questionNumbers,
            datasets: [{
                label: 'Correct/Incorrect',
                data: correctData,
                backgroundColor: userAnswers.map(a => a.isCorrect ? 
                    categoryColors[a.category].correct : 
                    categoryColors[a.category].incorrect),
                borderColor: userAnswers.map(a => a.isCorrect ? 
                    categoryColors[a.category].correct.replace('0.7', '1') : 
                    'rgb(255, 99, 132)'),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'x',
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            return value === 0 ? 'Incorrect' : 'Correct';
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Question Number'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            return `${userAnswers[index].isCorrect ? 'Correct' : 'Incorrect'} (${userAnswers[index].category})`;
                        },
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return `Time: ${userAnswers[index].timeSpent.toFixed(1)}s`;
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to create score distribution chart
function createScoreDistributionChart(categoryPerformance, score, questions) {
    const ctx = document.getElementById('scoreDistributionChart').getContext('2d');
    
    // Calculate category performance percentages
    const categories = Object.keys(categoryPerformance);
    const categoryScores = categories.map(cat => {
        const performance = categoryPerformance[cat];
        return Math.round((performance.correct / performance.total) * 100);
    });
    
    // Add overall score
    categories.push('Overall');
    categoryScores.push(Math.round((score / questions.length) * 100));
    
    // Create gradient for radar chart
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(54, 162, 235, 0.8)');
    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.2)');
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Performance (%)',
                data: categoryScores,
                fill: true,
                backgroundColor: gradient,
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20,
                        backdropColor: 'rgba(255, 255, 255, 0.8)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const category = categories[index];
                            if (category === 'Overall') {
                                return `Overall Score: ${context.raw}%`;
                            } else {
                                const catData = categoryPerformance[category];
                                return `${category}: ${context.raw}% (${catData.correct}/${catData.total})`;
                            }
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to create time analysis chart
function createTimeAnalysisChart(userAnswers) {
    const ctx = document.getElementById('timeAnalysisChart').getContext('2d');
    
    const questionNumbers = userAnswers.map(a => `Q${a.number}`);
    const timeData = userAnswers.map(a => a.timeSpent);
    const correctness = userAnswers.map(a => a.isCorrect);
    
    // Calculate average time
    const avgTime = timeData.reduce((a, b) => a + b, 0) / timeData.length;
    
    // Calculate average time for correct and incorrect answers
    const correctTimes = timeData.filter((_, i) => correctness[i]);
    const incorrectTimes = timeData.filter((_, i) => !correctness[i]);
    const avgCorrectTime = correctTimes.length ? correctTimes.reduce((a, b) => a + b, 0) / correctTimes.length : 0;
    const avgIncorrectTime = incorrectTimes.length ? incorrectTimes.reduce((a, b) => a + b, 0) / incorrectTimes.length : 0;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: questionNumbers,
            datasets: [
                {
                    label: 'Time Spent (seconds)',
                    data: timeData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.2,
                    pointBackgroundColor: correctness.map(correct => correct ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'),
                    pointRadius: 7,
                    pointStyle: correctness.map(correct => correct ? 'circle' : 'triangle'),
                    fill: false,
                    borderWidth: 3
                },
                {
                    label: 'Average Time',
                    data: Array(questionNumbers.length).fill(avgTime),
                    borderColor: 'rgba(128, 128, 128, 0.7)',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    borderWidth: 2
                },
                {
                    label: 'Avg Correct Time',
                    data: Array(questionNumbers.length).fill(avgCorrectTime),
                    borderColor: 'rgba(75, 192, 192, 0.5)',
                    borderDash: [3, 3],
                    pointRadius: 0,
                    fill: false,
                    borderWidth: 2,
                    hidden: true
                },
                {
                    label: 'Avg Incorrect Time',
                    data: Array(questionNumbers.length).fill(avgIncorrectTime),
                    borderColor: 'rgba(255, 99, 132, 0.5)',
                    borderDash: [3, 3],
                    pointRadius: 0,
                    fill: false,
                    borderWidth: 2,
                    hidden: true
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Question Number'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            if (context.datasetIndex === 0) {
                                const index = context.dataIndex;
                                const answer = userAnswers[index];
                                return [
                                    answer.isCorrect ? 'Correct' : 'Incorrect',
                                    `Category: ${answer.category}`
                                ];
                            }
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Function to create comparison chart
function createComparisonChart(userAnswers, score, questions) {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    // Calculate average time for correct and incorrect answers
    const correctTimes = userAnswers.filter(a => a.isCorrect).map(a => a.timeSpent);
    const incorrectTimes = userAnswers.filter(a => !a.isCorrect).map(a => a.timeSpent);
    
    const avgCorrectTime = correctTimes.length ? correctTimes.reduce((a, b) => a + b, 0) / correctTimes.length : 0;
    const avgIncorrectTime = incorrectTimes.length ? incorrectTimes.reduce((a, b) => a + b, 0) / incorrectTimes.length : 0;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Average Time', 'Performance'],
            datasets: [
                {
                    label: 'Correct Answers',
                    data: [avgCorrectTime, (score / questions.length) * 100],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                },
                {
                    label: 'Incorrect Answers',
                    data: [avgIncorrectTime, ((questions.length - score) / questions.length) * 100],
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Seconds / Percentage'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Metrics'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const datasetLabel = context.dataset.label;
                            const value = context.raw;
                            
                            if (context.dataIndex === 0) {
                                return `${datasetLabel}: ${value.toFixed(1)} seconds`;
                            } else {
                                return `${datasetLabel}: ${value.toFixed(1)}%`;
                            }
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to create strengths and weaknesses chart
function createStrengthsWeaknessesChart(categoryPerformance) {
    const ctx = document.getElementById('strengthsWeaknessesChart').getContext('2d');
    
    // Get categories and their performance
    const categories = Object.keys(categoryPerformance);
    const categoryPercentages = categories.map(cat => {
        const performance = categoryPerformance[cat];
        return Math.round((performance.correct / performance.total) * 100);
    });
    
    // Sort categories by performance
    const sortedData = categories.map((cat, i) => ({
        category: cat,
        percentage: categoryPercentages[i],
        questions: categoryPerformance[cat].total,
        correct: categoryPerformance[cat].correct,
        incorrect: categoryPerformance[cat].total - categoryPerformance[cat].correct
    })).sort((a, b) => b.percentage - a.percentage);
    
    // Create gradient colors based on performance
    const colors = sortedData.map(item => {
        if (item.percentage >= 80) return 'rgba(75, 192, 192, 0.7)'; // Green for strengths
        else if (item.percentage >= 50) return 'rgba(255, 205, 86, 0.7)'; // Yellow for average
        else return 'rgba(255, 99, 132, 0.7)'; // Red for weaknesses
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedData.map(item => item.category),
            datasets: [{
                label: 'Performance (%)',
                data: sortedData.map(item => item.percentage),
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Performance (%)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Category'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const item = sortedData[index];
                            return [
                                `Performance: ${item.percentage}%`,
                                `Correct: ${item.correct}/${item.questions}`,
                                `Incorrect: ${item.incorrect}/${item.questions}`
                            ];
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Create all charts
function createAllCharts(userAnswers, categoryPerformance, score, questions) {
    // Ensure Chart.js is loaded
    if (typeof Chart === 'undefined') {
        const chartScript = document.createElement('script');
        chartScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        chartScript.onload = function() {
            // Create charts once Chart.js is loaded
            createPerformanceChart(userAnswers);
            createScoreDistributionChart(categoryPerformance, score, questions);
            createTimeAnalysisChart(userAnswers);
            createComparisonChart(userAnswers, score, questions);
            createStrengthsWeaknessesChart(categoryPerformance);
        };
        document.head.appendChild(chartScript);
    } else {
        // Create charts if Chart.js is already loaded
        createPerformanceChart(userAnswers);
        createScoreDistributionChart(categoryPerformance, score, questions);
        createTimeAnalysisChart(userAnswers);
        createComparisonChart(userAnswers, score, questions);
        createStrengthsWeaknessesChart(categoryPerformance);
    }
}

// Enhanced showResults function
function showEnhancedResults(userAnswers, categoryPerformance, score, questions, quizStartTime, quizEndTime) {
    // Calculate quiz duration
    const quizDuration = (quizEndTime - quizStartTime) / 1000; // in seconds
    const minutes = Math.floor(quizDuration / 60);
    const seconds = Math.floor(quizDuration % 60);
    const formattedTime = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    
    // Update final score if the element exists
    const finalScoreElement = document.getElementById("final-score");
    if (finalScoreElement) {
        finalScoreElement.innerText = score;
    }
    
    // Update performance message based on score
    const scorePercentage = (score / questions.length) * 100;
    const performanceMessage = document.getElementById("performance-message");
    
    if (performanceMessage) {
        let message = '';
        if (scorePercentage >= 80) {
            message = `<strong>Excellent work!</strong> You've demonstrated expert knowledge. You completed the quiz in ${formattedTime}.`;
        } else if (scorePercentage >= 60) {
            message = `<strong>Good job!</strong> You have a solid understanding of the concepts. You completed the quiz in ${formattedTime}.`;
        } else {
            message = `<strong>Keep studying!</strong> Review the concepts and try again to improve your score. You completed the quiz in ${formattedTime}.`;
        }
        
        // Add strengths and weaknesses analysis
        let strengthsAndWeaknesses = '';
        if (Object.keys(categoryPerformance).length > 0) {
            const sortedCategories = Object.entries(categoryPerformance)
                .map(([category, data]) => ({
                    category, 
                    percentage: Math.round((data.correct / data.total) * 100)
                }))
                .sort((a, b) => b.percentage - a.percentage);
            
            const strengths = sortedCategories.filter(cat => cat.percentage >= 70);
            const weaknesses = sortedCategories.filter(cat => cat.percentage < 50);
            
            if (strengths.length > 0 || weaknesses.length > 0) {
                strengthsAndWeaknesses = '<div class="analysis-container"><h3>Performance Analysis</h3>';
                
                if (strengths.length > 0) {
                    strengthsAndWeaknesses += '<p><strong>Strengths:</strong> ';
                    strengthsAndWeaknesses += strengths.map(s => `${s.category} (${s.percentage}%)`).join(', ');
                    strengthsAndWeaknesses += '</p>';
                }
                
                if (weaknesses.length > 0) {
                    strengthsAndWeaknesses += '<p><strong>Areas to improve:</strong> ';
                    strengthsAndWeaknesses += weaknesses.map(w => `${w.category} (${w.percentage}%)`).join(', ');
                    strengthsAndWeaknesses += '</p>';
                }
                
                strengthsAndWeaknesses += '</div>';
            }
        }
        
        performanceMessage.innerHTML = message + strengthsAndWeaknesses;
    }
    
    // Setup the results container and create charts
    setupResultsContainer();
    
    // Create charts with a small delay to ensure the DOM is ready
    setTimeout(() => {
        createAllCharts(userAnswers, categoryPerformance, score, questions);
    }, 100);
}

// To integrate with your fetch_questions.js, add/modify this function:
function displayQuizResults() {
    // Record quiz end time if not already done
    if (!quizEndTime) {
        quizEndTime = new Date();
    }
    
    // Display results UI
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-container').style.display = 'block';
    
    // Call the enhanced results function
    showEnhancedResults(userAnswers, categoryPerformance, score, questions, quizStartTime, quizEndTime);
}

// Add this to the end of your original showResults function in fetch_questions.js
// or replace the original showResults function with this enhanced version
// Create result charts
function createResultCharts(score, total) {
    // Only create charts if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.log('Chart.js not available, skipping chart creation');
        return;
    }
    
    // Performance Chart (correct vs incorrect)
    const performanceCtx = document.getElementById('performanceChart').getContext('2d');
    new Chart(performanceCtx, {
        type: 'pie',
        data: {
            labels: ['Correct', 'Incorrect'],
            datasets: [{
                data: [score, total - score],
                backgroundColor: ['#4CAF50', '#F44336'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Score Distribution Chart
    const distributionCtx = document.getElementById('scoreDistributionChart').getContext('2d');
    new Chart(distributionCtx, {
        type: 'bar',
        data: {
            labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
            datasets: [{
                label: 'Your Score',
                data: [0, 0, 0, 0, 0],
                backgroundColor: '#2196F3',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });
    
    // Update the score distribution chart
    const percentage = (score / total) * 100;
    const category = Math.floor(percentage / 20);
    distributionCtx.chart.data.datasets[0].data[category] = 1;
    distributionCtx.chart.update();
}

