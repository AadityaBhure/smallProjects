// fetch_questions.js
// Fetches new questions from Gemini API and shows a popup

const API_KEY = "AIzaSyDwN3DSHp14M1TA7z1_MGmhGkUf0BHVhiI";  // API Key integrated

function showPopup(message) {
    const popup = document.getElementById("popup");
    popup.innerText = message;
    popup.style.display = "block";
    setTimeout(() => { popup.style.display = "none"; }, 3000);
}

async function fetchNewQuestions(difficulty) {
    showPopup("Generating new questions, please wait...");
    const prompt = `Generate 10 quiz questions on Theory of Computation with ${difficulty} difficulty in JSON format with question, options, and answer.`;
    
    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=" + API_KEY, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        const newQuestions = JSON.parse(data.candidates[0].output);
        localStorage.setItem("adaptiveQuizQuestions", JSON.stringify(newQuestions));
        localStorage.setItem("newQuizReady", "true");
        showPopup("New questions generated!");
    } catch (error) {
        console.error("Error fetching new quiz questions:", error);
        showPopup("Failed to generate questions.");
    }
}

// Add this to the bottom of your adaptive_quiz.js file
// or create a new script and include it in your HTML

// First, add the popup element to the HTML
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
    const quizTypes = quizTypeSelection.querySelector(".quiz-types");
    
    const apiQuizCard = document.createElement("div");
    apiQuizCard.className = "quiz-type-card";
    apiQuizCard.innerHTML = `
      <i class="fas fa-robot"></i>
      <h3>AI-Generated Quiz</h3>
      <p>10 questions dynamically generated with Gemini API</p>
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
  });
  
  // Define the fetchNewQuestions function
  //const API_KEY = "AIzaSyDBjWdLgWiQkNEJKiFDa365g9foGspGc-M";  // API Key
  
  function showPopup(message) {
      const popup = document.getElementById("popup");
      popup.innerText = message;
      popup.style.display = "block";
      setTimeout(() => { popup.style.display = "none"; }, 3000);
  }
  
  async function fetchNewQuestions(difficulty) {
    showPopup("Generating new questions, please wait...");
    const prompt = `Generate 10 quiz questions on Theory of Computation with ${difficulty} difficulty in JSON format with question, options, and answer.`;
    
    try {
        // Updated URL to use the Gemini API endpoint
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
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
                    maxOutputTokens: 1024
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API response:", data); // Debug log
        
        // Extract the response text from the Gemini API response structure
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error("Invalid response format from API");
        }
        
        const responseText = data.candidates[0].content.parts[0].text;
        
        try {
            // Try to parse the JSON from the response text
            // Need to locate the JSON part in the response
            const jsonStartIndex = responseText.indexOf('[');
            const jsonEndIndex = responseText.lastIndexOf(']') + 1;
            
            if (jsonStartIndex === -1 || jsonEndIndex === -1) {
                throw new Error("Could not find JSON in response");
            }
            
            const jsonString = responseText.substring(jsonStartIndex, jsonEndIndex);
            const newQuestions = JSON.parse(jsonString);
            
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
            showPopup("Failed to parse questions format.");
        }
    } catch (error) {
        console.error("Error fetching new quiz questions:", error);
        showPopup("Failed to generate questions: " + error.message);
    }
}
  
  // Function to start quiz with generated questions
  function startGeneratedQuiz() {
      // Hide the quiz type selection
      document.getElementById("quiz-type-selection").style.display = "none";
      
      // Show the quiz container
      document.getElementById("quiz-container").style.display = "block";
      
      // Get the questions from localStorage
      const questions = JSON.parse(localStorage.getItem("adaptiveQuizQuestions"));
      
      // Additional logic to initialize the quiz with these questions
      // This depends on how your adaptive_quiz.js is structured
      // You might need to call a function from adaptive_quiz.js here
      
      // If there's a function like initializeQuiz() in adaptive_quiz.js:
      if (typeof initializeQuiz === "function") {
          initializeQuiz(questions, "AI-Generated Quiz");
      } else {
          console.error("Could not find quiz initialization function");
      }
  }