const dataset = {
    "true_false": {
        "easy": [
            {"question": "C is a case-sensitive programming language.", "answer": true},
            {"question": "The main() function is optional in a C program.", "answer": false},
            {"question": "The ‘int’ data type in C can store decimal numbers.", "answer": false},
            {"question": "The switch statement can replace multiple if-else conditions.", "answer": true},
            {"question": "C programs can be compiled without including header files.", "answer": false},
            {"question": "An array in C can store values of different data types.", "answer": false},
            {"question": "The return statement is used to exit a function and return a value.", "answer": true},
            {"question": "The sizeof operator is used to determine the size of a variable or data type in bytes.", "answer": true},
            {"question": "C is an object-oriented programming language.", "answer": false},
            {"question": "The if statement in C must always be followed by an else statement.", "answer": false}
        ],
        "medium": [
            {"question": "In C, the break statement can be used to terminate a loop early.", "answer": true},
            {"question": "The continue statement in a loop stops execution of the loop completely.", "answer": false},
            {"question": "A function in C can return multiple values.", "answer": false},
            {"question": "A char variable in C can store more than one character.", "answer": false},
            {"question": "The switch statement in C can handle floating-point expressions.", "answer": false},
            {"question": "An array’s name in C acts as a pointer to its first element.", "answer": true},
            {"question": "Global variables in C are automatically initialized to zero if not assigned a value.", "answer": true},
            {"question": "In C, NULL and 0 are the same when used in the context of pointers.", "answer": true},
            {"question": "C does not support function overloading.", "answer": true},
            {"question": "If a for loop condition is left blank, it results in an infinite loop.", "answer": true}
        ],
        "hard": [
            {"question": "In C, void* can hold the address of any data type.", "answer": true},
            {"question": "The sizeof() operator in C is evaluated at runtime.", "answer": false},
            {"question": "Pointer arithmetic in C is not allowed.", "answer": false},
            {"question": "The main() function in C can return a value.", "answer": true},
            {"question": "Structures in C can contain pointers to themselves.", "answer": true},
            {"question": "In C, an array name acts as a pointer to the first element.", "answer": true},
            {"question": "Static variables have a default initial value of zero.", "answer": true},
            {"question": "A function can modify the value of a variable passed by value.", "answer": false},
            {"question": "All variables declared inside a function are stored in heap memory.", "answer": false},
            {"question": "A dangling pointer is a pointer that does not point to a valid memory location.", "answer": true}
        ]
    }
};


let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let quizType = "";
let answered = false;
let selectedDifficulty = "all";
let userAnswers = [];
let quizStartTime;
let quizEndTime;
let incorrectQuestions = [];
let categoryPerformance = {};

// Event listeners for initial buttons
document.addEventListener("DOMContentLoaded", function() {
    // Add Chart.js library if not already included
    if (typeof Chart === 'undefined') {
        const chartScript = document.createElement('script');
        chartScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        document.head.appendChild(chartScript);
    }

    // Create results graphs container if it doesn't exist
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
            <div class="graph-container">
                <h3 class="graph-title">Time Analysis</h3>
                <canvas id="timeAnalysisChart"></canvas>
            </div>
        `;
        
        resultsGraphsContainer.innerHTML = graphsHTML;
        
        // Insert before the buttons container in the results card
        const resultsCard = document.querySelector('.results-card');
        const buttonsContainer = document.querySelector('.buttons-container');
        resultsCard.insertBefore(resultsGraphsContainer, buttonsContainer);
        
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
            }
            @media (max-width: 768px) {
                .graph-row {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.getElementById("true-false-btn").addEventListener("click", function() {
        startQuiz("true_false");
    });
    
    document.getElementById("mcq-btn").addEventListener("click", function() {
        startQuiz("mcq");
    });
    
    document.getElementById("next-btn").addEventListener("click", nextQuestion);
    document.getElementById("retry-btn").addEventListener("click", function() {
        hideElement("results-container");
        showElement("quiz-type-selection");
    });
    
    document.getElementById("home-btn").addEventListener("click", function() {
        window.location.href = "index.html";
    });
    
    // Mobile menu toggle
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    
    if (hamburger) {
        hamburger.addEventListener("click", function() {
            navLinks.classList.toggle("open");
            hamburger.classList.toggle("active");
        });
    }
    
    // Add True/False button event listeners
    document.getElementById("true-btn").addEventListener("click", function() {
        checkTrueFalseAnswer(true);
    });
    
    document.getElementById("false-btn").addEventListener("click", function() {
        checkTrueFalseAnswer(false);
    });
});

// Helper functions to show/hide elements
function showElement(id) {
    document.getElementById(id).style.display = "block";
}

function hideElement(id) {
    document.getElementById(id).style.display = "none";
}

// Function to load questions based on difficulty and type
function loadQuestions(type, difficulty = "all") {
    let allQuestions = [];
    
    if (difficulty === "all") {
        allQuestions = [...dataset[type].easy, ...dataset[type].medium, ...dataset[type].hard];
    } else {
        allQuestions = [...dataset[type][difficulty]];
    }
    
    // Shuffle and pick 10 questions
    allQuestions.sort(() => Math.random() - 0.5);
    questions = allQuestions.slice(0, 10);
    
    // Add question numbers and categories
    questions.forEach((q, index) => {
        q.number = index + 1;
        
        // Determine question category from content (basic categorization)
        if (q.question.includes("DFA") || q.question.includes("NFA") || q.question.includes("automaton") || q.question.includes("automata")) {
            q.category = "Automata";
        } else if (q.question.includes("language") || q.question.includes("regular") || q.question.includes("context-free")) {
            q.category = "Languages";
        } else if (q.question.includes("Turing") || q.question.includes("decidable") || q.question.includes("recursive")) {
            q.category = "Computability";
        } else if (q.question.includes("NP") || q.question.includes("complexity") || q.question.includes("polynomial")) {
            q.category = "Complexity";
        } else {
            q.category = "General";
        }
    });
}

// Function to start the quiz
function startQuiz(type) {
    quizType = type;
    
    // Since we don't have a difficulty selection screen in the current HTML, 
    // we'll use "all" difficulty by default
    selectedDifficulty = "all";
    
    hideElement("quiz-type-selection");
    showElement("quiz-container");
    
    document.getElementById("quiz-title").innerText = quizType === "true_false" ? "True/False Quiz" : "Multiple Choice Quiz";
    
    // Reset quiz data
    loadQuestions(quizType, selectedDifficulty);
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    incorrectQuestions = [];
    categoryPerformance = {};
    
    // Reset UI elements
    document.getElementById("score-display").innerText = "0";
    document.getElementById("current-question").innerText = "1";
    document.getElementById("total-questions").innerText = questions.length;
    
    // Show or hide appropriate answer containers
    if (quizType === "true_false") {
        document.querySelector(".tf-container").style.display = "flex";
        document.getElementById("mcq-options").style.display = "none";
    } else {
        document.querySelector(".tf-container").style.display = "none";
        document.getElementById("mcq-options").style.display = "flex";
    }
    
    // Record quiz start time
    quizStartTime = new Date();
    
    // Initialize question start time
    questions.forEach(q => {
        q.startTime = null;
        q.timeSpent = 0;
    });
    
    // Set start time for first question
    questions[0].startTime = new Date();
    
    displayQuestion();
    updateProgressBar();
}

// Function to display the current question
function displayQuestion() {
    answered = false;

    if (currentQuestionIndex < questions.length) {
        let questionData = questions[currentQuestionIndex];
        document.getElementById("question-text").innerText = questionData.question;
        document.getElementById("feedback").innerText = "";
        document.getElementById("explanation").innerText = "";
        hideElement("next-container");
        
        // Update question counter
        document.getElementById("current-question").innerText = currentQuestionIndex + 1;
        
        // Reset button styles
        resetButtonStyles();

        // Set start time for this question
        questionData.startTime = new Date();

        if (quizType === "true_false") {
            // Enable True/False buttons
            document.getElementById("true-btn").disabled = false;
            document.getElementById("false-btn").disabled = false;
        } else {
            showMCQOptions(questionData.options);
        }
    } else {
        showResults();
    }
}

// Function to reset button styles
function resetButtonStyles() {
    // Reset True/False buttons
    document.getElementById("true-btn").classList.remove("correct", "incorrect");
    document.getElementById("false-btn").classList.remove("correct", "incorrect");
    
    // Reset MCQ buttons (if any)
    const mcqContainer = document.getElementById("mcq-options");
    while (mcqContainer.firstChild) {
        mcqContainer.removeChild(mcqContainer.firstChild);
    }
}

// Function to display MCQ options
function showMCQOptions(options) {
    const mcqContainer = document.getElementById("mcq-options");
    mcqContainer.innerHTML = "";
    
    options.forEach((option) => {
        const button = document.createElement("button");
        button.className = "button answer-btn";
        button.innerText = option;
        
        button.addEventListener("click", function() {
            if (!answered) {
                checkMCQAnswer(option);
            }
        });
        
        mcqContainer.appendChild(button);
    });
}

// Function to update progress bar
function updateProgressBar() {
    const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;
    document.getElementById("progress-bar").style.width = `${progressPercentage}%`;
}

// Function to check True/False answer
function checkTrueFalseAnswer(userAnswer) {
    if (answered) return;  // Prevent multiple answers
    
    answered = true;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = (userAnswer === currentQuestion.answer);
    
    // Calculate time spent on this question
    const endTime = new Date();
    currentQuestion.timeSpent = (endTime - currentQuestion.startTime) / 1000; // in seconds
    
    // Record user's answer
    userAnswers.push({
        question: currentQuestion.question,
        userAnswer: userAnswer ? "True" : "False",
        correctAnswer: currentQuestion.answer ? "True" : "False",
        isCorrect: isCorrect,
        timeSpent: currentQuestion.timeSpent,
        category: currentQuestion.category,
        number: currentQuestion.number
    });
    
    // Track category performance
    if (!categoryPerformance[currentQuestion.category]) {
        categoryPerformance[currentQuestion.category] = {
            correct: 0,
            total: 0
        };
    }
    categoryPerformance[currentQuestion.category].total++;
    if (isCorrect) {
        categoryPerformance[currentQuestion.category].correct++;
    } else {
        incorrectQuestions.push(currentQuestion);
    }
    
    // Update score
    if (isCorrect) {
        score++;
        document.getElementById("score-display").innerText = score;
        document.getElementById("feedback").innerText = "Correct!";
        document.getElementById("feedback").className = "correct-feedback";
    } else {
        document.getElementById("feedback").innerText = `Incorrect. The correct answer is ${currentQuestion.answer ? "True" : "False"}.`;
        document.getElementById("feedback").className = "incorrect-feedback";
    }
    
    // Highlight buttons
    if (userAnswer) {
        document.getElementById("true-btn").classList.add(isCorrect ? "correct" : "incorrect");
    } else {
        document.getElementById("false-btn").classList.add(isCorrect ? "correct" : "incorrect");
    }
    
    // Show next button
    showElement("next-container");
}

// Function to check MCQ answer
function checkMCQAnswer(userAnswer) {
    if (answered) return;  // Prevent multiple answers
    
    answered = true;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = (userAnswer === currentQuestion.answer);
    
    // Calculate time spent on this question
    const endTime = new Date();
    currentQuestion.timeSpent = (endTime - currentQuestion.startTime) / 1000; // in seconds
    
    // Record user's answer
    userAnswers.push({
        question: currentQuestion.question,
        userAnswer: userAnswer,
        correctAnswer: currentQuestion.answer,
        isCorrect: isCorrect,
        timeSpent: currentQuestion.timeSpent,
        category: currentQuestion.category,
        number: currentQuestion.number
    });
    
    // Track category performance
    if (!categoryPerformance[currentQuestion.category]) {
        categoryPerformance[currentQuestion.category] = {
            correct: 0,
            total: 0
        };
    }
    categoryPerformance[currentQuestion.category].total++;
    if (isCorrect) {
        categoryPerformance[currentQuestion.category].correct++;
    } else {
        incorrectQuestions.push(currentQuestion);
    }
    
    // Update score
    if (isCorrect) {
        score++;
        document.getElementById("score-display").innerText = score;
        document.getElementById("feedback").innerText = "Correct!";
        document.getElementById("feedback").className = "correct-feedback";
    } else {
        document.getElementById("feedback").innerText = `Incorrect. The correct answer is: ${currentQuestion.answer}`;
        document.getElementById("feedback").className = "incorrect-feedback";
    }
    
    // Highlight buttons
    const options = document.querySelectorAll("#mcq-options .answer-btn");
    options.forEach(button => {
        if (button.innerText === currentQuestion.answer) {
            button.classList.add("correct");
        } else if (button.innerText === userAnswer) {
            button.classList.add("incorrect");
        }
    });
    
    // Show next button
    showElement("next-container");
}

// Function to move to next question
function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
    updateProgressBar();
}

// Function to create performance chart
function createPerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    const questionNumbers = userAnswers.map(a => a.number);
    const correctData = userAnswers.map(a => a.isCorrect ? 1 : 0);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: questionNumbers,
            datasets: [{
                label: 'Correct (1) / Incorrect (0)',
                data: correctData,
                backgroundColor: correctData.map(value => value === 1 ? 'rgba(75, 192, 192, 0.7)' : 'rgba(255, 99, 132, 0.7)'),
                borderColor: correctData.map(value => value === 1 ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'),
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
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to create score distribution chart
function createScoreDistributionChart() {
    const ctx = document.getElementById('scoreDistributionChart').getContext('2d');
    
    // Calculate category performance percentages
    const categories = Object.keys(categoryPerformance);
    const categoryScores = categories.map(cat => {
        const performance = categoryPerformance[cat];
        return Math.round((performance.correct / performance.total) * 100);
    });
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Performance (%)',
                data: categoryScores,
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)'
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
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to create time analysis chart
function createTimeAnalysisChart() {
    const ctx = document.getElementById('timeAnalysisChart').getContext('2d');
    
    const questionNumbers = userAnswers.map(a => a.number);
    const timeData = userAnswers.map(a => a.timeSpent);
    const correctness = userAnswers.map(a => a.isCorrect);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: questionNumbers,
            datasets: [{
                label: 'Time Spent (seconds)',
                data: timeData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1,
                pointBackgroundColor: correctness.map(correct => correct ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'),
                pointRadius: 7,
                pointStyle: correctness.map(correct => correct ? 'circle' : 'triangle'),
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (seconds)'
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
                    display: true
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return userAnswers[index].isCorrect ? 'Correct' : 'Incorrect';
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Function to show quiz results
function showResults() {
    // Record quiz end time
    quizEndTime = new Date();
    const quizDuration = (quizEndTime - quizStartTime) / 1000; // in seconds
    
    // Format quiz duration
    const minutes = Math.floor(quizDuration / 60);
    const seconds = Math.floor(quizDuration % 60);
    const formattedTime = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    
    hideElement("quiz-container");
    showElement("results-container");
    
    document.getElementById("final-score").innerText = score;
    
    // Change icon and message based on score
    const resultsIcon = document.getElementById("results-icon");
    const performanceMessage = document.getElementById("performance-message");
    
    const scorePercentage = (score / questions.length) * 100;
    
    if (scorePercentage >= 80) {
        resultsIcon.className = "fas fa-trophy";
        resultsIcon.style.color = "#FFD700";
        performanceMessage.innerHTML = `<strong>Excellent work!</strong> You've demonstrated expert knowledge of Theory of Computation. You completed the quiz in ${formattedTime}.`;
    } else if (scorePercentage >= 60) {
        resultsIcon.className = "fas fa-medal";
        resultsIcon.style.color = "#C0C0C0";
        performanceMessage.innerHTML = `<strong>Good job!</strong> You have a solid understanding of the concepts. You completed the quiz in ${formattedTime}.`;
    } else {
        resultsIcon.className = "fas fa-book";
        resultsIcon.style.color = "#CD7F32";
        performanceMessage.innerHTML = `<strong>Keep studying!</strong> Review the concepts and try again to improve your score. You completed the quiz in ${formattedTime}.`;
    }
    
    // Create charts once the elements are visible
    setTimeout(() => {
        // Check if Chart.js is loaded
        if (typeof Chart !== 'undefined') {
            createPerformanceChart();
            createScoreDistributionChart();
            createTimeAnalysisChart();
        } else {
            // If Chart.js isn't loaded yet, wait for it
            const chartInterval = setInterval(() => {
                if (typeof Chart !== 'undefined') {
                    createPerformanceChart();
                    createScoreDistributionChart();
                    createTimeAnalysisChart();
                    clearInterval(chartInterval);
                }
            }, 100);
        }
    }, 100);
}
// This code enhances the existing chart functionality in your quiz application
// It should be added to your existing JavaScript file, replacing the current chart creation functions

// Function to create performance chart with enhanced visuals and information
function createPerformanceChart() {
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

// Function to create an enhanced score distribution chart
function createScoreDistributionChart() {
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

// Function to create an enhanced time analysis chart
function createTimeAnalysisChart() {
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

// Add a new function to create a comparison chart for correct vs. incorrect answers
function createComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    
    // Calculate average time for correct and incorrect answers
    const correctTimes = userAnswers.filter(a => a.isCorrect).map(a => a.timeSpent);
    const incorrectTimes = userAnswers.filter(a => !a.isCorrect).map(a => a.timeSpent);
    
    const avgCorrectTime = correctTimes.length ? correctTimes.reduce((a, b) => a + b, 0) / correctTimes.length : 0;
    const avgIncorrectTime = incorrectTimes.length ? incorrectTimes.reduce((a, b) => a + b, 0) / incorrectTimes.length : 0;
    
    // Create data for categories
    const categories = Object.keys(categoryPerformance);
    const categoryCorrectPercentages = categories.map(cat => {
        const performance = categoryPerformance[cat];
        return Math.round((performance.correct / performance.total) * 100);
    });
    
    const categoryIncorrectPercentages = categories.map(cat => {
        const performance = categoryPerformance[cat];
        return Math.round(((performance.total - performance.correct) / performance.total) * 100);
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Average Time', 'Category Performance'],
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

// Add a new function to create a strengths and weaknesses chart based on categories
function createStrengthsWeaknessesChart() {
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

// Enhance the showResults function to include the new charts
function showResults() {
    // Record quiz end time
    quizEndTime = new Date();
    const quizDuration = (quizEndTime - quizStartTime) / 1000; // in seconds
    
    // Format quiz duration
    const minutes = Math.floor(quizDuration / 60);
    const seconds = Math.floor(quizDuration % 60);
    const formattedTime = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
    
    hideElement("quiz-container");
    showElement("results-container");
    
    document.getElementById("final-score").innerText = score;
    
    // Change icon and message based on score
    const resultsIcon = document.getElementById("results-icon");
    const performanceMessage = document.getElementById("performance-message");
    
    const scorePercentage = (score / questions.length) * 100;
    
    if (scorePercentage >= 80) {
        resultsIcon.className = "fas fa-trophy";
        resultsIcon.style.color = "#FFD700";
        performanceMessage.innerHTML = `<strong>Excellent work!</strong> You've demonstrated expert knowledge of Theory of Computation. You completed the quiz in ${formattedTime}.`;
    } else if (scorePercentage >= 60) {
        resultsIcon.className = "fas fa-medal";
        resultsIcon.style.color = "#C0C0C0";
        performanceMessage.innerHTML = `<strong>Good job!</strong> You have a solid understanding of the concepts. You completed the quiz in ${formattedTime}.`;
    } else {
        resultsIcon.className = "fas fa-book";
        resultsIcon.style.color = "#CD7F32";
        performanceMessage.innerHTML = `<strong>Keep studying!</strong> Review the concepts and try again to improve your score. You completed the quiz in ${formattedTime}.`;
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
    
    // Add analysis to performance message
    performanceMessage.innerHTML += strengthsAndWeaknesses;
    
    // Ensure we have the additional chart containers in the DOM
    const resultsGraphsContainer = document.getElementById('results-graphs');
    
    if (resultsGraphsContainer) {
        // Add the new charts to the container
        if (!document.getElementById('comparisonChart')) {
            const comparisonContainer = document.createElement('div');
            comparisonContainer.className = 'graph-row';
            comparisonContainer.innerHTML = `
                <div class="graph-container">
                    <h3 class="graph-title">Correct vs Incorrect Comparison</h3>
                    <canvas id="comparisonChart"></canvas>
                </div>
                <div class="graph-container">
                    <h3 class="graph-title">Strengths & Weaknesses</h3>
                    <canvas id="strengthsWeaknessesChart"></canvas>
                </div>
            `;
            resultsGraphsContainer.appendChild(comparisonContainer);
        }
    }
    
    // Create charts once the elements are visible
    setTimeout(() => {
        // Check if Chart.js is loaded
        if (typeof Chart !== 'undefined') {
            createPerformanceChart();
            createScoreDistributionChart();
            createTimeAnalysisChart();
            createComparisonChart();
            createStrengthsWeaknessesChart();
        } else {
            // If Chart.js isn't loaded yet, wait for it
            const chartInterval = setInterval(() => {
                if (typeof Chart !== 'undefined') {
                    createPerformanceChart();
                    createScoreDistributionChart();
                    createTimeAnalysisChart();
                    createComparisonChart();
                    createStrengthsWeaknessesChart();
                    clearInterval(chartInterval);
                }
            }, 100);
        }
    }, 100);
}

