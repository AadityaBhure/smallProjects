// fetch_questions.js
// Fetches new questions from Gemini API and shows a popup

const API_KEY = "AIzaSyDBjWdLgWiQkNEJKiFDa365g9foGspGc-M";  // API Key integrated

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
